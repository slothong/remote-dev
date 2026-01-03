import {describe, it, expect} from 'vitest';
import {readPlanFile, parsePlan} from './plan-parser';

describe('plan.md 파일을 읽을 수 있다', () => {
  it('should read plan.md file from root directory', async () => {
    const content = await readPlanFile();

    expect(content).toBeDefined();
    expect(typeof content).toBe('string');
    expect(content.length).toBeGreaterThan(0);
  });

  it('should contain plan content', async () => {
    const content = await readPlanFile();

    expect(content).toContain('# Plan');
  });
});

describe('plan.md의 마크다운을 파싱할 수 있다', () => {
  it('should parse plan.md and return sections', async () => {
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
  it('should extract section titles', () => {
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
  it('should extract checkbox items', () => {
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
  it('should parse checked status', () => {
    const planContent = `# Plan

## Test Section
- [x] Completed task
- [ ] Pending task
`;

    const result = parsePlan(planContent);

    expect(result.sections[0].items[0].checked).toBe(true);
    expect(result.sections[0].items[1].checked).toBe(false);
  });
});
