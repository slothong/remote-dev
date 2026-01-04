import {describe, it, expect, vi} from 'vitest';
import type {Client, SFTPWrapper} from 'ssh2';
import {readPlanFile, parsePlan} from './plan-parser';

describe('plan.md 파일을 읽을 수 있다', () => {
  it('원격 서버에서 plan.md 파일을 읽는다', async () => {
    const planContent = `# Plan

## Section 1
- [x] Task 1`;

    const mockSftp = {
      readFile: vi.fn((path, encoding, callback) => {
        callback(null, Buffer.from(planContent));
      }),
    } as unknown as SFTPWrapper;

    const mockClient = {
      sftp: vi.fn(callback => {
        callback(null, mockSftp);
      }),
    } as unknown as Client;

    const result = await readPlanFile(mockClient);

    expect(result.success).toBe(true);
    expect(result.content).toBeDefined();
    expect(typeof result.content).toBe('string');
    expect(result.content!.length).toBeGreaterThan(0);
  });

  it('플랜 내용을 포함한다', async () => {
    const planContent = '# Plan\n\n## Test';

    const mockSftp = {
      readFile: vi.fn((path, encoding, callback) => {
        callback(null, Buffer.from(planContent));
      }),
    } as unknown as SFTPWrapper;

    const mockClient = {
      sftp: vi.fn(callback => {
        callback(null, mockSftp);
      }),
    } as unknown as Client;

    const result = await readPlanFile(mockClient);

    expect(result.content).toContain('# Plan');
  });
});

describe('plan.md의 마크다운을 파싱할 수 있다', () => {
  it('plan.md를 파싱하고 섹션을 반환한다', async () => {
    const planContent = `# Plan

## SSH 연결 기능
- [x] Task 1
- [ ] Task 2

## WebSocket 브릿지 서버
- [x] Task 3
- [ ] Task 4
`;

    const result = parsePlan(planContent);

    expect(result).toBeDefined();
    expect(result.sections).toHaveLength(2);
  });
});

describe('섹션 제목을 추출할 수 있다', () => {
  it('섹션 제목을 추출한다', () => {
    const planContent = `# Plan

## SSH 연결 기능
- [x] Task 1

## WebSocket 브릿지 서버
- [x] Task 2
`;

    const result = parsePlan(planContent);

    expect(result.sections[0].title).toBe('SSH 연결 기능');
    expect(result.sections[1].title).toBe('WebSocket 브릿지 서버');
  });
});

describe('체크박스 항목을 추출할 수 있다', () => {
  it('체크박스 항목을 추출한다', () => {
    const planContent = `# Plan

## Test Section
- [x] Completed task
- [ ] Pending task
- [x] Another completed task
`;

    const result = parsePlan(planContent);

    expect(result.sections[0].items).toHaveLength(3);
    expect(result.sections[0].items[0].text).toBe('Completed task');
    expect(result.sections[0].items[1].text).toBe('Pending task');
    expect(result.sections[0].items[2].text).toBe('Another completed task');
  });
});

describe('체크 상태를 파싱할 수 있다', () => {
  it('체크 상태를 파싱한다', () => {
    const planContent = `# Plan

## Test Section
- [x] Completed task
- [ ] Pending task
`;

    const result = parsePlan(planContent);

    expect(result.sections[0].items[0].checked).toBe(true);
    expect(result.sections[0].items[1].checked).toBe(false);
  });

  it('진행 중(-) 상태를 파싱한다', () => {
    const planContent = `# Plan

## Test Section
- [x] Completed task
- [-] In progress task
- [ ] Pending task
`;

    const result = parsePlan(planContent);

    expect(result.sections[0].items[0].checked).toBe(true);
    expect(result.sections[0].items[0].inProgress).toBe(false);
    expect(result.sections[0].items[1].checked).toBe(false);
    expect(result.sections[0].items[1].inProgress).toBe(true);
    expect(result.sections[0].items[2].checked).toBe(false);
    expect(result.sections[0].items[2].inProgress).toBe(false);
  });
});

describe('plan.md에 새 항목을 추가할 수 있다', () => {
  it('섹션에 새 항목을 추가한다', async () => {
    const {addPlanItem} = await import('./plan-parser');

    const planContent = `# Plan

## Test Section
- [ ] Existing task 1
- [x] Existing task 2

## Another Section
- [ ] Task in another section
`;

    const updated = addPlanItem(planContent, 'Test Section', 'New task');

    expect(updated).toContain('- [ ] New task');
    expect(updated).toContain('- [ ] Existing task 1');
    expect(updated).toContain('- [x] Existing task 2');

    // Verify the new item is in the right section
    const sections = updated.split('## ');
    const testSection = sections.find(s => s.startsWith('Test Section'));
    expect(testSection).toContain('- [ ] New task');
  });

  it('마지막 섹션의 끝에 항목을 추가한다', async () => {
    const {addPlanItem} = await import('./plan-parser');

    const planContent = `# Plan

## First Section
- [ ] Task 1

## Last Section
- [ ] Task 2
`;

    const updated = addPlanItem(planContent, 'Last Section', 'New last task');

    expect(updated).toContain('- [ ] New last task');

    // Verify it's at the end
    const lines = updated.split('\n');
    const newTaskLine = lines.findIndex(l => l.includes('New last task'));
    expect(newTaskLine).toBeGreaterThan(0);
  });
});

describe('plan.md에서 항목을 삭제할 수 있다', () => {
  it('섹션에서 항목을 삭제한다', async () => {
    const {deletePlanItem} = await import('./plan-parser');

    const planContent = `# Plan

## Test Section
- [ ] Task 1
- [x] Task 2
- [ ] Task 3

## Another Section
- [ ] Task in another section
`;

    const updated = deletePlanItem(planContent, 'Test Section', 1);

    expect(updated).toContain('- [ ] Task 1');
    expect(updated).toContain('- [ ] Task 3');
    expect(updated).not.toContain('- [x] Task 2');
  });

  it('첫 번째 항목을 삭제한다', async () => {
    const {deletePlanItem} = await import('./plan-parser');

    const planContent = `# Plan

## Test Section
- [ ] Task 1
- [ ] Task 2
`;

    const updated = deletePlanItem(planContent, 'Test Section', 0);

    expect(updated).not.toContain('- [ ] Task 1');
    expect(updated).toContain('- [ ] Task 2');
  });
});

describe('plan.md의 체크 상태를 업데이트할 수 있다', () => {
  it('항목의 체크 상태를 업데이트한다', async () => {
    const {updateCheckStatus, writePlanFile} = await import('./plan-parser');

    const planContent = `# Plan

## Test Section
- [ ] Task to check
- [x] Already checked
`;

    const updated = updateCheckStatus(planContent, 'Test Section', 0, true);

    expect(updated).toContain('- [x] Task to check');
    expect(updated).toContain('- [x] Already checked');

    // Test writing to remote
    const mockSftp = {
      writeFile: vi.fn((path, content, encoding, callback) => {
        callback(null);
      }),
    } as unknown as SFTPWrapper;

    const mockClient = {
      sftp: vi.fn(callback => {
        callback(null, mockSftp);
      }),
    } as unknown as Client;

    const writeResult = await writePlanFile(mockClient, updated);
    expect(writeResult.success).toBe(true);
  });

  it('항목의 체크를 해제한다', async () => {
    const {updateCheckStatus} = await import('./plan-parser');

    const planContent = `# Plan

## Test Section
- [x] Task to uncheck
`;

    const updated = updateCheckStatus(planContent, 'Test Section', 0, false);

    expect(updated).toContain('- [ ] Task to uncheck');
  });
});
