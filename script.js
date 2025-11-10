(() => {
const stage=document.getElementById('stage');
const canvas=document.createElement('canvas');
canvas.id='fw';
document.body.appendChild(canvas);
const ctx=canvas.getContext('2d',{alpha:true});
const bgm=document.getElementById('bgm');
const sfx=document.getElementById('sfxFail');

function resize(){
  canvas.width=innerWidth;canvas.height=innerHeight;
}
resize();addEventListener('resize',resize);

bgm.play().catch(()=>{addEventListener('pointerdown',()=>bgm.play(),{once:true});});

// Setup sprites
const sprites=Array.from(document.querySelectorAll('.sprite')).map(el=>{
  const size=parseFloat(el.dataset.size||'0.2')*Math.min(innerWidth,innerHeight);
  el.style.width=size+'px';
  return {el,x:Math.random()*(innerWidth-size),y:Math.random()*(innerHeight-size),vx:80-160*Math.random(),vy:80-160*Math.random(),w:size,h:size};
});

let last = performance.now();
function step(t){
  const dt = (t - last) / 1000;
  last = t;
  sprites.forEach(s => {
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    if (s.x <= 0){ s.x = 0; s.vx *= -1; }
    if (s.y <= 0){ s.y = 0; s.vy *= -1; }
    if (s.x + s.w >= innerWidth){ s.x = innerWidth - s.w; s.vx *= -1; }
    if (s.y + s.h >= innerHeight){ s.y = innerHeight - s.h; s.vy *= -1; }
    s.el.style.transform = `translate(${s.x}px, ${s.y}px)`;
  });
  requestAnimationFrame(step);
}
requestAnimationFrame(step);


// Fireworks dummy fade bg
function fire(){
  ctx.fillStyle='rgba(11,11,18,0.22)';ctx.fillRect(0,0,canvas.width,canvas.height);
  requestAnimationFrame(fire);
}
fire();

// Messages
const schopenhauer=[
  "Talent hits a target no one else can hit; genius hits a target no one else can see.",
  "Compassion is the basis of morality.",
  "A man can be himself only so long as he is alone.",
  "We forfeit three-fourths of ourselves in order to be like other people.",
  "The person who writes for fools is always sure of a large audience."
];
let fishStep=0;
function fishMsg(){
  fishStep=(fishStep+1)%3;
  return ["BLEY","BLEEEYYY","BLEYYYYYYYYYYYYYYYY"][fishStep];
}
function rand(arr){return arr[Math.floor(Math.random()*arr.length)];}

const msgs={
  Fish:()=>fishMsg(),
  Frog:()=>"I'm just a frog",
  Person:()=>rand(schopenhauer)
};

sprites.forEach(s=>{
  s.el.addEventListener('click',()=>{
    const text=msgs[s.el.alt]?msgs[s.el.alt]():"";
    const div=document.createElement('div');
    div.className='speech';
    div.textContent=text;
    div.style.left=s.x+s.w/2+'px';
    div.style.top=s.y-10+'px';
    stage.appendChild(div);
    setTimeout(()=>div.remove(),1500);
  });
});

// Revolution button
document.getElementById('revolution').addEventListener('click',()=>{
  document.getElementById('overlay').classList.add('active');
  sfx.play().catch(()=>{});
});
})();
