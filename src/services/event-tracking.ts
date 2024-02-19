import { QuizElementType } from '@src/enums';
import type { Cover, ElementItemStore } from '@src/interfaces';

export class EventTrackingService {
  public static trackNextScreen(element: HTMLElement) {
    const event = new CustomEvent('q-tracking-event', {
      bubbles: true,
      detail: {
        eventInfo: {
          componentName: 'q-quiz',
          eventAction: 'next-screen',
          eventNonInteractive: false,
        },
      },
    });
    element.dispatchEvent(event);
  }

  public static trackClickLink(
    title: string,
    link: string,
    step: number | string,
    element: HTMLElement
  ) {
    const event = new CustomEvent('q-tracking-event', {
      bubbles: true,
      detail: {
        eventInfo: {
          componentName: 'q-quiz',
          eventAction: `link-${title}-${step}-${link}`,
          eventNonInteractive: false,
        },
      },
    });
    element.dispatchEvent(event);
  }

  public static trackAnswer(
    title: string,
    step: number,
    countSteps: number,
    element: HTMLElement
  ) {
    try {
      const event = new CustomEvent('q-tracking-event', {
        bubbles: true,
        detail: {
          eventInfo: {
            componentName: 'q-quiz',
            eventAction: `answer-${title}-${step}-${countSteps}`,
            eventNonInteractive: false,
          },
        },
      });
      element.dispatchEvent(event);
    } catch (err) {
      return 'err ' + err;
    }
  }

  // TODO: rename
  public static getDetails(
    items: ElementItemStore[],
    itemId: string,
    event: Event | CustomEvent
  ) {
    let element = event.target as HTMLElement;

    if (!element) {
      // TODO: set type
      const cstEvent = event as any;
      element = cstEvent.explicitOriginalTarget as HTMLElement;
    }

    const cover = items.find((item) => item.item.type === QuizElementType.Cover)
      ?.item as Cover | undefined;

    let title = itemId;

    if (cover) {
      title = cover.title;
    }

    return { title, element };
  }
}
