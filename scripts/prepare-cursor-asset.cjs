const sharp = require('sharp');
(async () => {
 const source='/Users/chaewonlim/Library/Application Support/Hermes/composer-images/image_0dea32.png';
 const {data,info}=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 // The supplied screenshot has an opaque near-white matte (247,247,247).
 // Unmatte it so the user's glow does not leave rectangular boxes.
 for(let i=0;i<data.length;i+=4){
  const a=Math.max(0,Math.min(1,(247-Math.min(data[i],data[i+1],data[i+2]))/247));
  for(let c=0;c<3;c++) data[i+c]=a>0.008?Math.max(0,Math.min(255,247+(data[i+c]-247)/a)):0;
  data[i+3]=a>0.008?Math.round(a*data[i+3]):0;
 }
 await sharp(data,{raw:{width:info.width,height:info.height,channels:4}}).resize({width:160}).png().toFile('public/cursor-glow.png');
 console.log('Prepared uploaded glow as transparent public/cursor-glow.png');
})().catch(e=>{console.error(e);process.exitCode=1});
