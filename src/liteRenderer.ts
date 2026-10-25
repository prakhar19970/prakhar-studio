import * as THREE from 'three';

/** A small, depth-buffered fallback for browsers without WebGL. It renders the
 * same scene and interactions, with simpler lighting and a capped frame rate. */
export function makeRenderer(defaults: any): THREE.WebGLRenderer {
  const canvas=defaults.canvas as HTMLCanvasElement;
  const webgl=canvas.getContext('webgl2',{alpha:true,antialias:true});
  if(webgl)return new THREE.WebGLRenderer({...defaults,context:webgl,alpha:true,antialias:true,powerPreference:'high-performance'});
  const ctx=canvas.getContext('2d',{alpha:true})!;
  let width=1,height=1,cssWidth=1,cssHeight=1,last=0;
  let image=ctx.createImageData(1,1),depth=new Float32Array(1);
  const textures=new Map<number,ImageData>();
  const projection=new THREE.Matrix4(),combined=new THREE.Matrix4(),normals=new THREE.Matrix3();
  const normal=new THREE.Vector3(),lightDirection=new THREE.Vector3(-3,7,5).normalize();
  const color=new THREE.Color();
  const renderer:any={
    domElement:canvas,isLiteRenderer:true,outputColorSpace:THREE.SRGBColorSpace,
    setPixelRatio:()=>{},getPixelRatio:()=>1,setClearColor:()=>{},
    getSize:(target?:THREE.Vector2)=>target?target.set(cssWidth,cssHeight):{width:cssWidth,height:cssHeight},
    setSize:(w:number,h:number)=>{
      cssWidth=w;cssHeight=h;const scale=Math.min(1,760/w,660/h);
      width=Math.max(1,Math.round(w*scale));height=Math.max(1,Math.round(h*scale));
      canvas.width=width;canvas.height=height;canvas.style.width=w+'px';canvas.style.height=h+'px';
      image=ctx.createImageData(width,height);depth=new Float32Array(width*height);
    },
    dispose:()=>textures.clear(),forceContextLoss:()=>{},renderLists:{dispose:()=>{}},
    render:(scene:THREE.Scene,camera:THREE.Camera)=>{
      const now=performance.now();if(now-last<100||document.hidden)return;last=now;
      image.data.fill(0);depth.fill(Infinity);
      scene.updateMatrixWorld();camera.updateMatrixWorld();
      projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
      let lightStrength=1;
      scene.traverse(o=>{if((o as THREE.DirectionalLight).isDirectionalLight)lightStrength=Math.min(1,(o as THREE.Light).intensity/3)});
      scene.traverseVisible(object=>{
        const mesh=object as THREE.Mesh;if(!mesh.isMesh)return;
        const geometry=mesh.geometry,material=mesh.material as THREE.MeshStandardMaterial;
        if(!geometry?.attributes.position||Array.isArray(material)||!material.visible||(material as any).isShadowMaterial)return;
        const positions=geometry.attributes.position,uv=geometry.attributes.uv,vertexNormals=geometry.attributes.normal;
        const indices=geometry.index;const count=indices?indices.count:positions.count;
        combined.multiplyMatrices(projection,mesh.matrixWorld);normals.getNormalMatrix(mesh.matrixWorld);
        const e=combined.elements,projected=new Float32Array(positions.count*3);
        for(let i=0;i<positions.count;i++){
          const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i);
          const inv=1/(e[3]*x+e[7]*y+e[11]*z+e[15]);
          projected[i*3]=((e[0]*x+e[4]*y+e[8]*z+e[12])*inv*.5+.5)*width;
          projected[i*3+1]=(-((e[1]*x+e[5]*y+e[9]*z+e[13])*inv)*.5+.5)*height;
          projected[i*3+2]=(e[2]*x+e[6]*y+e[10]*z+e[14])*inv;
        }
        let tex:ImageData|undefined;
        if(material.map?.image instanceof HTMLCanvasElement){
          tex=textures.get(material.map.id);
          if(!tex){const source=material.map.image;tex=source.getContext('2d')!.getImageData(0,0,source.width,source.height);textures.set(material.map.id,tex)}
        }
        for(let i=0;i<count;i+=3){
          const a=indices?indices.getX(i):i,b=indices?indices.getX(i+1):i+1,c=indices?indices.getX(i+2):i+2;
          const x0=projected[a*3],y0=projected[a*3+1],z0=projected[a*3+2],x1=projected[b*3],y1=projected[b*3+1],z1=projected[b*3+2],x2=projected[c*3],y2=projected[c*3+1],z2=projected[c*3+2];
          const area=(x1-x0)*(y2-y0)-(y1-y0)*(x2-x0);
          if(Math.abs(area)<.001||(area>=0&&material.side!==THREE.DoubleSide)||z0>1||z0< -1)continue;
          const minX=Math.max(0,Math.floor(Math.min(x0,x1,x2))),maxX=Math.min(width-1,Math.ceil(Math.max(x0,x1,x2))),minY=Math.max(0,Math.floor(Math.min(y0,y1,y2))),maxY=Math.min(height-1,Math.ceil(Math.max(y0,y1,y2)));
          if(minX>maxX||minY>maxY)continue;
          if(vertexNormals)normal.set(vertexNormals.getX(a)+vertexNormals.getX(b)+vertexNormals.getX(c),vertexNormals.getY(a)+vertexNormals.getY(b)+vertexNormals.getY(c),vertexNormals.getZ(a)+vertexNormals.getZ(b)+vertexNormals.getZ(c)).applyMatrix3(normals).normalize();
          else normal.set(0,1,0);
          const shade=.57+Math.max(0,normal.dot(lightDirection))*.55*lightStrength;
          color.copy(material.color??new THREE.Color('#fff')).multiplyScalar(shade).convertLinearToSRGB();
          const red=Math.min(255,Math.round(color.r*255)),green=Math.min(255,Math.round(color.g*255)),blue=Math.min(255,Math.round(color.b*255));
          const alpha=Math.round((material.opacity??1)*255);
          const u0=tex&&uv?uv.getX(a):0,v0=tex&&uv?uv.getY(a):0,u1=tex&&uv?uv.getX(b):0,v1=tex&&uv?uv.getY(b):0,u2=tex&&uv?uv.getX(c):0,v2=tex&&uv?uv.getY(c):0;
          for(let py=minY;py<=maxY;py++)for(let px=minX;px<=maxX;px++){
            const x=px+.5,y=py+.5;
            const wa=((x1-x)*(y2-y)-(y1-y)*(x2-x))/area;
            if(wa<0)continue;
            const wb=((x2-x)*(y0-y)-(y2-y)*(x0-x))/area;
            if(wb<0)continue;
            const wc=1-wa-wb;if(wc<0)continue;
            const z=wa*z0+wb*z1+wc*z2,pixel=py*width+px;if(z>=depth[pixel])continue;
            depth[pixel]=z;const dest=pixel*4;
            if(tex){
              const tx=Math.min(tex.width-1,Math.max(0,Math.floor((wa*u0+wb*u1+wc*u2)*tex.width)));
              const ty=Math.min(tex.height-1,Math.max(0,Math.floor((1-wa*v0-wb*v1-wc*v2)*tex.height)));
              const source=(ty*tex.width+tx)*4,brightness=material.emissiveIntensity>.1?1:Math.min(1.1,shade);
              image.data[dest]=Math.min(255,tex.data[source]*brightness);image.data[dest+1]=Math.min(255,tex.data[source+1]*brightness);image.data[dest+2]=Math.min(255,tex.data[source+2]*brightness);
            }else{image.data[dest]=red;image.data[dest+1]=green;image.data[dest+2]=blue}
            image.data[dest+3]=alpha;
          }
        }
      });
      ctx.putImageData(image,0,0);
    }
  };
  return renderer as THREE.WebGLRenderer;
}
