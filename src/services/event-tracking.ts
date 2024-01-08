export class EventTrackingService {
  public static trackNextScreen(element: HTMLElement) {
    let quizControlEvent = new CustomEvent('q-tracking-event', {
      bubbles: true,
      detail: {
        eventInfo: {
          componentName: 'q-quiz',
          eventAction: 'next-screen',
          eventNonInteractive: false,
        },
      },
    });
    element.dispatchEvent(quizControlEvent);
  }

  public static trackAnswer() {}
}
