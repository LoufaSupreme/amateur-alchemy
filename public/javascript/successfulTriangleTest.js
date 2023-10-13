// adapted from https://codepen.io/a413x/pen/OJbwoxz

//variables
const container = document.querySelector('.content');
const containerWidth = container.getBoundingClientRect().width;
const dimensions = {
  w: containerWidth*0.8/3, h: containerWidth*0.8/3 * 1.2, margin: 20
}
const cupContainer = document.querySelector('.cup-container');
const actualUniqueCup = document.querySelector(".thanks").dataset.actualUnique;

let blackSheep;
let currWindowWidth = window.innerWidth;
let cups;

function buildCups(){
  cups = initialization()
}

function initialization(){
  const cups = [createCup('cup1'), createCup('cup2', true), createCup('cup3')]
  const app = document.querySelector('.app')
  app.style.width = dimensions.w*3 + dimensions.margin*2 + 'px'
  app.style.height = dimensions.h + 'px'
  setInitialState(cups)
  return cups
}

function setInitialState(cups){
  cups.forEach((cup, idx) => {
    const offset = (dimensions.w + dimensions.margin)*idx
    cup.style.transform = `translateX(${offset}px)`;
    
    const cupLetter = createCupLabel(cup, idx);
    if (cupLetter === actualUniqueCup) {
      const uniqueMarker = createUniqueMarker();
      uniqueMarker.style.transform = `translate(calc(-25% + ${offset+dimensions.w/2-dimensions.margin/2}px), ${dimensions.h*0.7}px)`;
    }
  })
}

//create cup
function createCup(id, hasBall = false){
  const cup = document.createElement('div')
  cup.id = id
  cup.classList.add('cup')
  cup.append(createTemplate())
  cup.style.zIndex = 1

  document.querySelector('.cup-container').append(cup)
  return cup
}

// create label for each cup
function createCupLabel(cup, idx) {
  const letters = ['A', 'B', 'C'];
  const label = document.createElement('div');
  label.classList.add('cup-label')
  label.innerText = letters[idx];
  label.style.zIndex = 10;
  
  cup.classList.add(`cup-${letters[idx]}`);
  cup.append(label);

  return letters[idx];
}

// black sheep image under the cup to indicate it's the odd beer out
function createUniqueMarker() {
  const unique = document.createElement('img');
  unique.classList.add('unique-marker');
  unique.src = '/images/black-sheep-64.png';

  document.querySelector('.cup-container').append(unique);

  blackSheep = unique;

  return unique;
}

//cup svg element
function createTemplate(){
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.classList.add('cup-svg')
  const ellipseTop = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
  const ellipseBot = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
  const trapezoid = document.createElementNS('http://www.w3.org/2000/svg', 'polyline')

  const {w, h} = dimensions
  const strokeW = 4
  const ellipseTopRx = (w - strokeW)/3.6
  const ellipseTopRy = 10
  const ellipseBotRy = 20

  svg.setAttribute('width', w)
  svg.setAttribute('height', h)

  ellipseTop.setAttribute('cx', w/2)
  ellipseTop.setAttribute('cy', ellipseTopRy + strokeW/2)
  ellipseTop.setAttribute('rx', ellipseTopRx)
  ellipseTop.setAttribute('ry', ellipseTopRy)
  ellipseTop.setAttribute('stroke-width', strokeW)

  trapezoid.setAttribute('points',
    [
      strokeW/2,
      h - strokeW/2 - ellipseBotRy,
      w/2 - ellipseTopRx,
      ellipseTopRy + strokeW/2,
      w/2 + ellipseTopRx,
      ellipseTopRy + strokeW/2,
      w - strokeW/2,
      h - strokeW/2 - ellipseBotRy
    ].join(',')
  )
  trapezoid.setAttribute('stroke-width', strokeW)

  ellipseBot.setAttribute('cx', w/2)
  ellipseBot.setAttribute('cy', h - strokeW/2 - ellipseBotRy)
  ellipseBot.setAttribute('rx', (w - strokeW)/2)
  ellipseBot.setAttribute('ry', ellipseBotRy)
  ellipseBot.setAttribute('stroke-width', strokeW)

  const flare = document.createElementNS('http://www.w3.org/2000/svg', 'polyline')
  flare.setAttribute('points',
    [
      w/2 - ellipseTopRx + strokeW + 5,
      ellipseTopRy + strokeW + 10,
      w/2 - ellipseTopRx + strokeW + 10,
      ellipseTopRy + strokeW + 10,
      strokeW + 10,
      h - ellipseBotRy - strokeW,
    ].join(',')
  )
  flare.classList.add('flare')

  svg.append(ellipseBot, trapezoid, ellipseTop, flare)
  return svg
}

function raiseCup() {
  const uniqueCup = document.querySelector(`.cup-${actualUniqueCup}`);
  uniqueCup.style.transform += "translateY(-40%)";
}

function onResize(){
  // mobile browsers will fire the resize event everytime the scroll bars or nav disappear/reappear
  // check if window actually resized
  const windowWidth = window.innerWidth;

  if (windowWidth == currWindowWidth) return;

  // reset dimensions based on width of content box
  const containerWidth = container.getBoundingClientRect().width;

  dimensions.w = containerWidth*0.8/3;
  dimensions.h = containerWidth*0.8/3 * 1.2;
  dimensions.margin = 20;

  // delete existing cups
  cupContainer.innerHTML = "";

  // remake cups
  buildCups()
}

// make the sheep say something when it's clicked
function bahhh() {
  let count = 0;
  const sheepSounds = [
    "Pasteurize?? No I said I'm a pasture guy.",
    "Why do the horses always get the blankets?? I feel fleeced.",
    "Don't hate me cause you ain't me",
    "What do these beers and my Friday night have in common? Barnyard funk.",
    "Once you go black sheep you never go back sheep",
    "I'm getting a lot of grassy/vegetal notes... Fucking delicious."
  ];

  return () => {
    makeAlert(sheepSounds[count % (sheepSounds.length)],3000);
    count++;
  }
}

buildCups();
onResize();
window.addEventListener('resize', onResize);
blackSheep.addEventListener('click', bahhh())

setTimeout(() => {raiseCup()}, 3000)