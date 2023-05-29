export default {
  inserted: el => {
    function loadImage() {
      if (!el) return;
      const imageElement = Array.from(el.children).find(
        el =>
          el.nodeName === "IMG" &&
          el.id === "fileNodeView-lazy-load-preview-image"
      );
      const spinnerElement = Array.from(el.children).find(
        el => el.id === "fileNodeView-lazy-load-image-spinner"
      );

      if (imageElement) {
        imageElement.addEventListener("load", () => {
          setTimeout(() => el.classList.add("loaded"), 100);
        });
        imageElement.addEventListener("error", () => console.log("error"));

        const editorDom = document.getElementById("editor__content");

        const {
          clientHeight: viewportHeight,
          clientWidth: viewportWidth
        } = editorDom;
        const img = new Image();
        img.src = imageElement.dataset.url;
        let imgHeight, imgWidth;

        img.onload = function() {
          imgHeight = img.height;
          imgWidth = img.width;

          const MAX_IMG_WIDTH = viewportWidth / 2;
          const MAX_IMG_HEIGHT = viewportHeight - 100;

          const RATIO_WIDTH = imgWidth / MAX_IMG_WIDTH;
          const RATIO_HEIGHT = imgHeight / MAX_IMG_HEIGHT;

          const RATIO_ASPECT =
            RATIO_WIDTH > RATIO_HEIGHT ? RATIO_WIDTH : RATIO_HEIGHT;

          imageElement.width = imgWidth / RATIO_ASPECT;
          imageElement.height = imgHeight / RATIO_ASPECT;
          imageElement.src = img.src;
          imageElement.dataset.url = "";
          spinnerElement.style.display = 'none';
        };
      }
    }

    function handleIntersect(entries, observer) {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        loadImage();
        observer.unobserve(el);
      });
    }

    function createObserver() {
      const editorDom = document.getElementById("idea-edit-editor-container");
      const options = {
        // circumstances under which the observer's callback is invoked
        root: editorDom, // defaults to the browser viewport if not specified or if null
        threshold: 0.1 // the degree of intersection between the target element and its root (0 - 1)
        // threshold of 1.0 means that when 100% of the target is visible within
        //the element specified by the root option, the callback is invoked
      };

      // Whether you're using the viewport or some other element as the root,the API works the same way,
      // executing a callback function you provide whenever the visibility of the target element changes
      // so that it crosses desired amounts of intersection with the root

      const observer = new IntersectionObserver(handleIntersect, options);

      observer.observe(el); // target element to watch
    }

    if (!window["IntersectionObserver"]) {
      loadImage();
    } else {
      createObserver();
    }
  }
};
