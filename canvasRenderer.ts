import { BirdSkin, Pipe, Particle, Theme } from '../types';

export function drawSky(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: Theme,
  time: number
) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);

  if (theme === 'DAY') {
    gradient.addColorStop(0, '#38bdf8'); // sky-400
    gradient.addColorStop(0.7, '#7dd3fc'); // sky-300
    gradient.addColorStop(1, '#bae6fd'); // sky-200
  } else if (theme === 'NIGHT') {
    gradient.addColorStop(0, '#0f172a'); // slate-900
    gradient.addColorStop(0.6, '#1e1b4b'); // indigo-950
    gradient.addColorStop(1, '#312e81'); // indigo-900
  } else {
    // SUNSET
    gradient.addColorStop(0, '#4c1d95'); // violet-900
    gradient.addColorStop(0.4, '#c026d3'); // fuchsia-600
    gradient.addColorStop(0.8, '#f97316'); // orange-500
    gradient.addColorStop(1, '#fde047'); // yellow-300
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Night stars
  if (theme === 'NIGHT') {
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 30; i++) {
      const starX = (i * 47 + Math.sin(i) * 100) % width;
      const starY = (i * 23) % (height * 0.5);
      const twinkle = (Math.sin(time * 0.003 + i) + 1) * 0.5;
      ctx.globalAlpha = 0.3 + twinkle * 0.7;
      ctx.fillRect(starX, starY, (i % 3 === 0 ? 2 : 1), (i % 3 === 0 ? 2 : 1));
    }
    ctx.globalAlpha = 1.0;
  }
}

export function drawCitySkyline(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  groundY: number,
  theme: Theme,
  scrollX: number
) {
  const cityColor =
    theme === 'DAY'
      ? '#38a16922'
      : theme === 'NIGHT'
      ? '#1e293b99'
      : '#7c2d1255';

  ctx.fillStyle = cityColor;
  
  // Distant buildings parallax (slower scroll)
  const offset = (scrollX * 0.2) % 300;
  
  const buildingWidths = [40, 60, 35, 50, 45, 65, 30, 55];
  const buildingHeights = [120, 180, 100, 150, 130, 200, 90, 160];

  let currentX = -offset - 300;

  while (currentX < width + 300) {
    buildingWidths.forEach((w, idx) => {
      const h = buildingHeights[idx];
      const y = groundY - h;
      ctx.fillRect(currentX, y, w - 2, h);

      // Windows
      if (theme === 'NIGHT' || theme === 'SUNSET') {
        ctx.fillStyle = theme === 'NIGHT' ? '#fef08a33' : '#fde04733';
        for (let wx = currentX + 6; wx < currentX + w - 10; wx += 12) {
          for (let wy = y + 10; wy < groundY - 15; wy += 20) {
            if ((wx + wy) % 3 !== 0) {
              ctx.fillRect(wx, wy, 6, 10);
            }
          }
        }
        ctx.fillStyle = cityColor;
      }

      currentX += w;
    });
  }
}

export function drawClouds(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scrollX: number,
  theme: Theme
) {
  const cloudColor =
    theme === 'DAY'
      ? 'rgba(255, 255, 255, 0.75)'
      : theme === 'NIGHT'
      ? 'rgba(255, 255, 255, 0.15)'
      : 'rgba(254, 215, 170, 0.5)';

  ctx.fillStyle = cloudColor;
  const cloudOffset = (scrollX * 0.4) % (width + 400);

  const clouds = [
    { x: 100, y: height * 0.15, scale: 1 },
    { x: 350, y: height * 0.22, scale: 0.8 },
    { x: 600, y: height * 0.12, scale: 1.2 },
    { x: 850, y: height * 0.25, scale: 0.9 },
  ];

  clouds.forEach((c) => {
    let cx = c.x - cloudOffset;
    if (cx < -200) cx += width + 400;

    const r = 25 * c.scale;
    ctx.beginPath();
    ctx.arc(cx, c.y, r, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.8, c.y - r * 0.3, r * 0.9, 0, Math.PI * 2);
    ctx.arc(cx + r * 1.6, c.y, r * 0.8, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.8, c.y + r * 0.2, r * 0.7, 0, Math.PI * 2);
    ctx.fill();
  });
}

export function drawGround(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  groundY: number,
  scrollX: number,
  theme: Theme
) {
  const groundHeight = height - groundY;

  // Grass layer
  const grassColor = theme === 'NIGHT' ? '#15803d' : '#22c55e';
  const dirtColor = theme === 'NIGHT' ? '#78350f' : '#b45309';

  ctx.fillStyle = grassColor;
  ctx.fillRect(0, groundY, width, 14);

  // Grass highlight line
  ctx.fillStyle = theme === 'NIGHT' ? '#4ade80' : '#86efac';
  ctx.fillRect(0, groundY, width, 3);

  // Dirt layer
  ctx.fillStyle = dirtColor;
  ctx.fillRect(0, groundY + 14, width, groundHeight - 14);

  // Decorative scrolling ground stripes
  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
  const stripeWidth = 20;
  const offset = scrollX % (stripeWidth * 2);

  for (let x = -stripeWidth * 2; x < width + stripeWidth * 2; x += stripeWidth * 2) {
    ctx.beginPath();
    ctx.moveTo(x - offset, groundY + 14);
    ctx.lineTo(x - offset + stripeWidth, groundY + 14);
    ctx.lineTo(x - offset, height);
    ctx.lineTo(x - offset - stripeWidth, height);
    ctx.closePath();
    ctx.fill();
  }
}

export function drawPipe(
  ctx: CanvasRenderingContext2D,
  pipe: Pipe,
  pipeWidth: number,
  groundY: number,
  theme: Theme
) {
  const topColor = theme === 'NIGHT' ? '#166534' : '#15803d'; // green-700 / green-800
  const mainColor = theme === 'NIGHT' ? '#22c55e' : '#4ade80'; // green-500 / green-400
  const highlightColor = '#bbf7d0'; // green-200
  const capHeight = 24;
  const capLip = 6;

  const drawSinglePipe = (x: number, y: number, w: number, h: number, isTop: boolean) => {
    if (h <= 0) return;

    // Pipe body gradient
    const grad = ctx.createLinearGradient(x, 0, x + w, 0);
    grad.addColorStop(0, topColor);
    grad.addColorStop(0.25, mainColor);
    grad.addColorStop(0.65, mainColor);
    grad.addColorStop(0.85, topColor);
    grad.addColorStop(1, '#052e16');

    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);

    // Pipe highlight
    ctx.fillStyle = highlightColor;
    ctx.globalAlpha = 0.3;
    ctx.fillRect(x + w * 0.15, y, w * 0.1, h);
    ctx.globalAlpha = 1.0;

    // Pipe border
    ctx.strokeStyle = '#052e16';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(x, y, w, h);

    // Cap at the end
    const capY = isTop ? y + h - capHeight : y;
    const capX = x - capLip;
    const capW = w + capLip * 2;

    const capGrad = ctx.createLinearGradient(capX, 0, capX + capW, 0);
    capGrad.addColorStop(0, topColor);
    capGrad.addColorStop(0.3, mainColor);
    capGrad.addColorStop(0.8, topColor);
    capGrad.addColorStop(1, '#052e16');

    ctx.fillStyle = capGrad;
    ctx.fillRect(capX, capY, capW, capHeight);
    ctx.strokeRect(capX, capY, capW, capHeight);

    // Cap highlight line
    ctx.fillStyle = highlightColor;
    ctx.globalAlpha = 0.4;
    ctx.fillRect(capX + capW * 0.15, capY, capW * 0.1, capHeight);
    ctx.globalAlpha = 1.0;
  };

  // Top pipe
  drawSinglePipe(pipe.x, 0, pipeWidth, pipe.topHeight, true);

  // Bottom pipe
  const bottomY = pipe.topHeight + (groundY - pipe.topHeight - pipe.bottomHeight); // Or pipe.topHeight + gap
  const actualBottomHeight = groundY - bottomY;
  drawSinglePipe(pipe.x, bottomY, pipeWidth, actualBottomHeight, false);

  // Draw floating star/coin in the gap if present
  if (pipe.hasCoin && !pipe.coinCollected) {
    const coinX = pipe.x + pipeWidth / 2;
    const coinY = pipe.coinY;

    ctx.save();
    ctx.translate(coinX, coinY);
    
    // Glowing aura
    ctx.fillStyle = '#fef08a';
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Star coin shape
    ctx.fillStyle = '#f59e0b'; // amber-500
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fde047'; // yellow-300
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();

    // Center star detail
    ctx.fillStyle = '#d97706';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', 0, 1);

    ctx.restore();
  }
}

export function drawBird(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rotation: number,
  skin: BirdSkin,
  wingPos: number, // -1 to 1 for wing flapping oscillation
  scale: number = 1
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(scale, scale);

  const radius = 17;

  // Bird outer shadow/glow
  ctx.fillStyle = skin.trailColor;
  ctx.beginPath();
  ctx.arc(-2, 2, radius + 2, 0, Math.PI * 2);
  ctx.fill();

  // Bird main body
  ctx.fillStyle = skin.color;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Belly highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.beginPath();
  ctx.arc(-3, 3, radius * 0.6, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  const eyeX = 8;
  const eyeY = -6;
  ctx.fillStyle = skin.eyeColor;
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Pupil
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(eyeX + 2, eyeY - 1, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Beak
  ctx.fillStyle = skin.beakColor;
  ctx.beginPath();
  ctx.moveTo(11, -1);
  ctx.lineTo(24, 3);
  ctx.lineTo(11, 8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Wing
  const wingYOffset = wingPos * 8;
  ctx.fillStyle = skin.wingColor;
  ctx.beginPath();
  ctx.ellipse(-7, 2 + wingYOffset, 10, 6, (wingPos * Math.PI) / 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
}

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  particles.forEach((p) => {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}
