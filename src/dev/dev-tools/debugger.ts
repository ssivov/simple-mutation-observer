let enabled: boolean = false;

export function devDebug(): void {
  if (enabled) {
    // tslint:disable-next-line: no-debugger
    debugger;
  }
}

export function enable(): void {
  enabled = true;
}

export function disabled(): void {
  enabled = false;
}