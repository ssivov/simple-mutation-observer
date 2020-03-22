import { getFixtureWormhole } from "../utils/dom";
import SimpleMutationObserverTestWrapper from "../utils/simple-observer";

let simpleMutationObserver = new SimpleMutationObserverTestWrapper();

export function setup(): void {
  setupFixture();
  setupObservers();
}

export function setupFixture(): void {
  fixture.setBase('karma/setup');
  fixture.load('wormhole.html');
}

export function setupObservers(): void {
  simpleMutationObserver = new SimpleMutationObserverTestWrapper();
  simpleMutationObserver.observe();
}

export function cleanupAfterTest(): void {
  simpleMutationObserver.disconnect();
  fixture.cleanup();
}

export function setupHtml(html: string, preserveSpaces: boolean = false): void {
  if (!preserveSpaces) {
    html = html.replace(/(\s){2,}/g, '');
  }
  simpleMutationObserver.disconnect()
  getFixtureWormhole().innerHTML = html;
  simpleMutationObserver.observe();
}

export function getSimpleMutationObserver(): SimpleMutationObserverTestWrapper {
  return simpleMutationObserver;
}
