// Backyard Mech carousel: slide data + rendering + controls all live here.
// Add a car by pushing another slide object onto `slides` -- the photos,
// counter, and click handling all render from the array. The matching
// markup shell lives in views/backyard-mech/backyard-mech.pug.
document.addEventListener('DOMContentLoaded', () => {

  const slides = [
    {
      photo: require('../assets/img/cars/subaru.png'),
      title: 'Subaru',
      subtitle: '// nick: subarin',
      tagline: '// An abandoned GC8 that became my first restoration during the pandemic. Today it is a full racing build, running a custom Speeduino distro and a self-built body control system.'
    },
    {
      photo: require('../assets/img/cars/peugeot.png'),
      title: 'NFS Peugeot',
      subtitle: '// nick: 106 Peugeot',
      tagline: "// My current daily driver — when it's running. Mostly stock: I modeled a few aero parts and let Alissa handle sound and body control."
    },
    {
      photo: require('../assets/img/cars/tube-car.png'),
      title: 'Racing Dream',
      subtitle: '// nick: tube car',
      tagline: '// The most ambitious project of the three: a car built from zero, pushing Alissa to her maximum by combining combustion and electric motors.'
    }
  ];

  const photoStage = document.getElementById('carousel-photo-stage');
  const textContainer = document.getElementById('carousel-text-container');
  const counter = document.getElementById('carousel-counter');
  const nextButton = document.getElementById('carousel-next-button');

  if (!photoStage || !textContainer || !counter || !nextButton) return;

  const photoEls = [];
  const textEls = [];
  const indexEls = [];
  const connectorEls = [];

  // Shared by the connectors between labels and the final one linking the
  // last label to the next button, so both animate identically.
  const createConnector = (isActive) => {
    const track = document.createElement('span');
    track.className =
      'carousel-connector relative mx-2 h-px overflow-hidden bg-gray-300 transition-all duration-500 ease-out ' +
      (isActive ? 'w-15 sm:w-20' : 'w-6 sm:w-10');
    track.setAttribute('aria-hidden', 'true');

    const fill = document.createElement('span');
    fill.className =
      'carousel-connector-fill absolute inset-0 origin-left bg-teal-600 transition-transform duration-500 ease-out ' +
      (isActive ? 'scale-x-100' : 'scale-x-0');
    track.appendChild(fill);

    return { track, fill };
  };

  slides.forEach((slide, index) => {
    const img = document.createElement('img');
    img.className = 'carousel-photo absolute inset-0 h-full w-full object-contain';
    if (index !== 0) img.classList.add('hidden');
    img.src = slide.photo;
    img.alt = slide.title;
    photoStage.appendChild(img);
    photoEls.push(img);

    const text = document.createElement('div');
    text.className = 'carousel-text';
    if (index !== 0) text.classList.add('hidden');

    const subtitle = document.createElement('p');
    subtitle.className = 'font-mono text-sm text-teal-600';
    subtitle.textContent = slide.subtitle;

    const title = document.createElement('h3');
    title.className = 'mt-3 font-mono text-4xl font-extrabold text-gray-900 sm:text-5xl';
    title.textContent = slide.title;

    const tagline = document.createElement('p');
    tagline.className = 'mt-4 font-mono text-sm leading-6 text-gray-700';
    tagline.textContent = slide.tagline;

    text.appendChild(subtitle);
    text.appendChild(title);
    text.appendChild(tagline);
    textContainer.appendChild(text);
    textEls.push(text);

    // Connector line before every label except the first, so the counter
    // reads "01 -- 02 -- 03". While slide `index - 1` is active, its track
    // widens and its fill grows in, so the distance between the selected
    // item and the next is visibly longer than the gaps between the others.
    if (index > 0) {
      const { track, fill } = createConnector(index - 1 === 0);
      counter.appendChild(track);
      connectorEls.push({ track, fill });
    }

    const label = document.createElement('span');
    label.className =
      'carousel-index transition-colors duration-300 ' +
      (index === 0 ? 'text-teal-600 font-bold' : 'text-gray-500');
    label.textContent = String(index + 1).padStart(2, '0');
    counter.appendChild(label);
    indexEls.push(label);
  });

  // One more connector linking the last label to the next button, so the
  // line continues right up to the control -- active (and widened) exactly
  // when the last slide is selected, same as any other connector.
  const { track: lastTrack, fill: lastFill } = createConnector(slides.length - 1 === 0);
  counter.appendChild(lastTrack);
  connectorEls.push({ track: lastTrack, fill: lastFill });

  let currentIndex = 0;

  const showSlide = (index) => {
    photoEls.forEach((photo, i) => {
      if (i === index) {
        photo.classList.remove('hidden');
      } else {
        photo.classList.add('hidden');
      }
    });

    textEls.forEach((text, i) => {
      if (i === index) {
        text.classList.remove('hidden');
      } else {
        text.classList.add('hidden');
      }
    });

    indexEls.forEach((label, i) => {
      if (i === index) {
        label.classList.remove('text-gray-500');
        label.classList.add('text-teal-600', 'font-bold');
      } else {
        label.classList.remove('text-teal-600', 'font-bold');
        label.classList.add('text-gray-500');
      }
    });

    connectorEls.forEach(({ track, fill }, i) => {
      if (i === index) {
        fill.classList.remove('scale-x-0');
        fill.classList.add('scale-x-200');
        track.classList.remove('w-6', 'sm:w-10');
        track.classList.add('w-15', 'sm:w-20');
      } else {
        fill.classList.remove('scale-x-200');
        fill.classList.add('scale-x-0');
        track.classList.remove('w-15', 'sm:w-20');
        track.classList.add('w-6', 'sm:w-10');
      }
    });
  };

  nextButton.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % slides.length;
    showSlide(currentIndex);
  });
});
