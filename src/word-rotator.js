(function() {
  const spacer = document.getElementById('wordSpacer');
  const words = document.querySelectorAll('.rotating-word');
  const inner = document.querySelector('.word-rotator-inner');
  const heroImage = document.querySelector('.hero-image');
  let currentIndex = 0;

  // Image map
  const imageMap = {
    'memories': 'assets/images/memories.webp',
    'files': 'assets/images/files.webp',
    'research': 'assets/images/research.webp',
    'adventures': 'assets/images/adventures.webp'
  };

  // Preload images
  Object.values(imageMap).forEach(src => {
    const img = new Image();
    img.src = src;
  });

  spacer.textContent = words[0].textContent;
  gsap.set(inner, { width: spacer.offsetWidth });

  function rotateWord() {
    const currentWord = words[currentIndex];
    const nextIndex = (currentIndex + 1) % words.length;
    const nextWord = words[nextIndex];
    const nextWordText = nextWord.textContent.trim();
    const newImageSrc = imageMap[nextWordText];

    spacer.textContent = nextWord.textContent;
    const nextWidth = spacer.offsetWidth;
    spacer.textContent = currentWord.textContent;

    const tl = gsap.timeline();

    tl.to(inner, {
      width: nextWidth,
      duration: 0.7,
      ease: 'power2.inOut'
    })
    .to(currentWord, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.inOut'
    }, 0);

    // Image transition synced with word fade
    if (newImageSrc && heroImage.src.indexOf(newImageSrc) === -1) {
      tl.to(heroImage, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.inOut'
      }, 0)
      .add(() => {
        heroImage.src = newImageSrc;
      })
      .to(heroImage, {
        opacity: 1,
        duration: 0.4,
        ease: 'power2.inOut'
      });
    }

    tl.fromTo(nextWord,
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: 'power2.inOut' },
      0.2
    );

    tl.add(() => {
      spacer.textContent = nextWord.textContent;
      currentIndex = nextIndex;
    });
  }

  setInterval(rotateWord, 3000);
})();
