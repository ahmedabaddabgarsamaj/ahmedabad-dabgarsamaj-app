const Jimp = require('jimp-compact');
const path = require('path');
const fs = require('fs');

async function generateCleanIcons() {
  console.log('--- Generating Clean PWA & Mobile Icons ---');
  const logoPath = path.resolve('assets/images/logo.png');
  const rawLogo = await Jimp.read(logoPath);
  console.log('Loaded base logo:', rawLogo.bitmap.width, 'x', rawLogo.bitmap.height);

  // Crop logo tightly to its non-transparent bounds
  const tightLogo = rawLogo.clone().crop(110, 2, 1086, 1172);
  console.log('Tight logo size:', tightLogo.bitmap.width, 'x', tightLogo.bitmap.height);

  // ==========================================
  // 1. 512x512 Solid White Background (PWA & iOS)
  // ==========================================
  // Safe zone diameter is ~320px (62.5% of 512), completely avoiding any Android/iOS crop
  const logo512 = tightLogo.clone().resize(Jimp.AUTO, 320);
  const x512 = Math.round((512 - logo512.bitmap.width) / 2);
  const y512 = Math.round((512 - logo512.bitmap.height) / 2);

  const icon512White = new Jimp(512, 512, 0xFFFFFFFF);
  icon512White.composite(logo512, x512, y512);

  // Write 512x512 white icons
  await icon512White.writeAsync('assets/images/icon.png');
  await icon512White.writeAsync('public/icon.png');
  await icon512White.writeAsync('public/icon-512.png');
  console.log('✅ Generated assets/images/icon.png & public/icon-512.png with solid WHITE background');

  // ==========================================
  // 2. 192x192 Solid White Background (PWA)
  // ==========================================
  const logo192 = tightLogo.clone().resize(Jimp.AUTO, 120);
  const x192 = Math.round((192 - logo192.bitmap.width) / 2);
  const y192 = Math.round((192 - logo192.bitmap.height) / 2);

  const icon192White = new Jimp(192, 192, 0xFFFFFFFF);
  icon192White.composite(logo192, x192, y192);

  await icon192White.writeAsync('public/icon-192.png');
  console.log('✅ Generated public/icon-192.png with solid WHITE background');

  // ==========================================
  // 3. 180x180 Apple Touch Icon (iOS Safari Home Screen)
  // ==========================================
  const logo180 = tightLogo.clone().resize(Jimp.AUTO, 115);
  const x180 = Math.round((180 - logo180.bitmap.width) / 2);
  const y180 = Math.round((180 - logo180.bitmap.height) / 2);

  const appleTouchIcon = new Jimp(180, 180, 0xFFFFFFFF);
  appleTouchIcon.composite(logo180, x180, y180);

  await appleTouchIcon.writeAsync('public/apple-touch-icon.png');
  console.log('✅ Generated public/apple-touch-icon.png with solid WHITE background (No black background on iOS)');

  // ==========================================
  // 4. Android Adaptive Icons (Safe Zone Padding)
  // ==========================================
  // Solid white background for Android
  const androidBg = new Jimp(512, 512, 0xFFFFFFFF);
  await androidBg.writeAsync('assets/images/android-icon-background.png');

  // Transparent foreground with 320px safe-padded logo
  const androidFg = new Jimp(512, 512, 0x00000000);
  androidFg.composite(logo512, x512, y512);
  await androidFg.writeAsync('assets/images/android-icon-foreground.png');
  await androidFg.writeAsync('assets/images/android-icon-monochrome.png');
  console.log('✅ Generated assets/images/android-icon-foreground.png & background.png with 62.5% Safe Zone (Zero Cropping on Android)');

  // ==========================================
  // 5. Favicon
  // ==========================================
  const favicon = tightLogo.clone().resize(Jimp.AUTO, 42);
  const xFav = Math.round((48 - favicon.bitmap.width) / 2);
  const yFav = Math.round((48 - favicon.bitmap.height) / 2);
  const favImg = new Jimp(48, 48, 0xFFFFFFFF);
  favImg.composite(favicon, xFav, yFav);
  await favImg.writeAsync('public/favicon.png');
  await favImg.writeAsync('assets/images/favicon.png');
  console.log('✅ Generated clean favicons');

  console.log('🎉 All icons successfully generated with solid white backgrounds and safe zone padding!');
}

generateCleanIcons().catch((err) => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
