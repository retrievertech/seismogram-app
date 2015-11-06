//
//  Calls a function when the element is scrolled 100px from its bottom.
//

export class ScrollToBottom {
  constructor() {

    // Padding from bottom in pixels
    // at which to load more images.
    var padding = 100,
        hitBottom = false;

    return {
      scope: {
        scrollToBottom: "="
      },
      link: (scope, element, attrs) => {
        element.bind("scroll", (e) => {
          var el = element[0],
              elHeight = el.getBoundingClientRect().height;
          
          if ((el.scrollTop + elHeight) >= (el.scrollHeight - padding)) {
            // Don't call the scrollToBottom callback again
            // until the first call resolves.
            if (hitBottom) {
              return;
            }

            hitBottom = true;
            // TODO: Don't assume that scrollToBottom returns a promise.
            scope.scrollToBottom().then(() => {
              hitBottom = false;
            });
          }
        });
      }
    }
  }
}