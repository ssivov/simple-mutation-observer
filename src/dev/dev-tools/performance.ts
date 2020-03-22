interface IMutationPerformance {
  executionMilliseconds: number;
  mutationCount: number;
  mutationRecordCount: number;
}

class PerformanceRecorder {

  public name: string;

  private executionMilliseconds: number = 0;
  private mutationCount: number = 0;
  private mutationRecordCount: number = 0;
  private mutationStartTime: number | null = null;

  constructor(name: string) {
    this.name = name;
  }

  public onMutationStart(): void {
    if (this.mutationStartTime !== null) {
      throw new Error('Previous mutation processing has not finished yet');
    }
    this.mutationStartTime = getTimestamp();
  }

  public onMutationEnd(mutations: MutationRecord[]): void {
    if (this.mutationStartTime === null) {
      throw new Error('Mutation processing has not started');
    }
    const mutationDuration = getTimestamp() - this.mutationStartTime;
    this.mutationCount++;
    this.executionMilliseconds += mutationDuration;
    this.mutationRecordCount += mutations.length;
    this.mutationStartTime = null;
  }

  public getPerformanceData(): IMutationPerformance {
    return {
      executionMilliseconds: this.executionMilliseconds,
      mutationCount: this.mutationCount,
      mutationRecordCount: this.mutationRecordCount
    };
  }

  public reset(): void {
    this.executionMilliseconds = 0;
    this.mutationCount = 0;
    this.mutationRecordCount = 0;
  }
}

const defaultSourceName = 'simple-mutation';
const recorders: Map<string, PerformanceRecorder> = new Map();

export function onMutationStart(source?: string): void {
  getRecorder(source).onMutationStart();
}

export function onMutationEnd(mutations: MutationRecord[], source?: string): void {
  getRecorder(source).onMutationEnd(mutations);
}

export function getPerformanceData(source?: string): IMutationPerformance {
  return getRecorder(source).getPerformanceData();
}

function getRecorder(source?: string): PerformanceRecorder {
  source = source || defaultSourceName;
  recorders.set(source, recorders.get(source) || new PerformanceRecorder(source));
  return recorders.get(source) as PerformanceRecorder;
}

function getTimestamp(): number {
  return (
    'performance' in window && typeof window.performance.now === 'function'
    ? window.performance.now()
    : new Date().getMilliseconds()
  );
}
