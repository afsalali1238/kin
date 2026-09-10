import json, struct, os, math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
os.makedirs('public/models',exist_ok=True)
verts=[]; uvs=[]; faces=[]; group=''
for line in open('/tmp/body.obj'):
 p=line.split()
 if not p:continue
 if p[0]=='v':verts.append(list(map(float,p[1:4])))
 if p[0]=='vt':uvs.append(list(map(float,p[1:3])))
 if p[0]=='g':group=p[1]
 if p[0]=='f' and group=='body':
  f=[tuple(int(a)-1 for a in q.split('/')[:2]) for q in p[1:]]
  for i in range(1,len(f)-1):faces.append([f[0],f[i],f[i+1]])
base=np.array(verts); uv=np.array(uvs)
# Region labels are authored in source-space, then baked into the original, non-mirrored UV atlas.
def region(p):
 x,y,z=p; a=abs(x); side='left' if x>0 else 'right'; front=z>0
 if y>7.9:return 'forehead'
 if y>7.15:return 'jaw'
 if y>6.25 and a<.8:return 'neck'
 if y>5.4 and a>1.35:return 'shoulder-'+side
 if a>1.65 and y>.25:
  if y<.8:return 'hand-'+side
  if y<2:return 'wrist-'+side
  if y<3.4:return 'forearm-'+side
  if y<4.2:return 'elbow-'+side
  return 'upper-arm-'+side
 if y>3.65:return 'chest' if front else 'upper-back'
 if y>2.1+.13*(a/1.5)**2:return 'abdomen' if front else 'lower-back'
 if y>.25:return 'hip-'+side
 if y>-2.7:return 'thigh-'+side
 if y>-3.8:return 'knee-'+side
 if y>-6.5:return 'calf-'+side
 if y>-7.3:return 'ankle-'+side
 return 'foot-'+side
names=['forehead','jaw','neck','chest','upper-back','abdomen','lower-back']+[f'{r}-{s}' for r in ['shoulder','upper-arm','elbow','forearm','wrist','hand','hip','thigh','knee','calf','ankle','foot'] for s in ['left','right']]
colors={n:((i+1)*7,40,80) for i,n in enumerate(names)}
maskdata=np.zeros((2048,2048,3),dtype=np.uint8)
for face in faces:
 world=base[[v for v,t in face]]
 tri=np.array([(uv[t][0]*2047,(1-uv[t][1])*2047) for v,t in face])
 xmin=max(0,int(np.floor(tri[:,0].min())));xmax=min(2047,int(np.ceil(tri[:,0].max())))
 ymin=max(0,int(np.floor(tri[:,1].min())));ymax=min(2047,int(np.ceil(tri[:,1].max())))
 xx,yy=np.meshgrid(np.arange(xmin,xmax+1)+.5,np.arange(ymin,ymax+1)+.5)
 ax,ay=tri[0];bx,by=tri[1];cx,cy=tri[2]
 den=(by-cy)*(ax-cx)+(cx-bx)*(ay-cy)
 if abs(den)<1e-8:continue
 aa=((by-cy)*(xx-cx)+(cx-bx)*(yy-cy))/den
 bb=((cy-ay)*(xx-cx)+(ax-cx)*(yy-cy))/den
 cc=1-aa-bb;inside=(aa>=0)&(bb>=0)&(cc>=0)
 if not inside.any():continue
 positions=aa[inside,None]*world[0]+bb[inside,None]*world[1]+cc[inside,None]*world[2]
 reds=np.fromiter((colors[region(p)][0] for p in positions),dtype=np.uint8,count=len(positions))
 block=maskdata[ymin:ymax+1,xmin:xmax+1];block[inside]=np.column_stack((reds,np.full(len(reds),40),np.full(len(reds),80)))
mask=Image.fromarray(maskdata)
# Extend only blank island gutters, never overwrite an existing region boundary.
expanded=np.array(mask.filter(ImageFilter.MaxFilter(3)));blank=maskdata[:,:,0]==0;maskdata[blank]=expanded[blank]
Image.fromarray(maskdata).save('public/models/body-regions.png')
for sex in ['male','female']:
 v=base.copy()
 for line in open('/tmp/'+sex+'.target'):
  p=line.split()
  if len(p)==4 and p[0].isdigit():v[int(p[0])]+=np.array(list(map(float,p[1:])))
 # Preserve original anatomical pose; normalize to 1.8m, floor at zero.
 used=sorted(set(i for f in faces for i,t in f)); lo=v[used,1].min(); hi=v[used,1].max(); scale=1.8/(hi-lo)
 v[:,1]-=lo;v*=scale
 normals=np.zeros_like(v)
 for f in faces:
  ids=[i for i,t in f];a,b,c=v[ids];n=np.cross(b-a,c-a)
  for i in ids:normals[i]+=n
 normals/=np.maximum(np.linalg.norm(normals,axis=1)[:,None],1e-9)
 pos=[];ns=[];tex=[];ix=[];seen={}
 for f in faces:
  for pair in f:
   if pair not in seen:
    seen[pair]=len(pos);i,t=pair;pos.append(v[i]);ns.append(normals[i]);tex.append(uv[t])
   ix.append(seen[pair])
 arrays=[np.array(pos,dtype='<f4'),np.array(ns,dtype='<f4'),np.array(tex,dtype='<f4'),np.array(ix,dtype='<u4')]
 blob=b'';views=[];access=[]
 for j,arr in enumerate(arrays):
  raw=arr.tobytes();views.append({'buffer':0,'byteOffset':len(blob),'byteLength':len(raw),'target':34963 if j==3 else 34962});blob+=raw
  ac={'bufferView':j,'componentType':5125 if j==3 else 5126,'count':len(arr),'type':['VEC3','VEC3','VEC2','SCALAR'][j]}
  if j==0:ac.update(min=arr.min(axis=0).tolist(),max=arr.max(axis=0).tolist())
  access.append(ac)
 doc={'asset':{'version':'2.0','generator':'Kinesio · CC0 MakeHuman conversion'},'scene':0,'scenes':[{'nodes':[0]}],'nodes':[{'mesh':0,'name':'Body'}],'meshes':[{'primitives':[{'attributes':{'POSITION':0,'NORMAL':1,'TEXCOORD_0':2},'indices':3,'material':0}]}],'materials':[{'name':'Skin','pbrMetallicRoughness':{'baseColorFactor':[.67,.43,.31,1],'metallicFactor':0,'roughnessFactor':.57}}],'buffers':[{'byteLength':len(blob)}],'bufferViews':views,'accessors':access}
 js=json.dumps(doc,separators=(',',':')).encode();js+=b' '*((-len(js))%4);blob+=b'\0'*((-len(blob))%4)
 out=struct.pack('<III',0x46546c67,2,28+len(js)+len(blob))+struct.pack('<II',len(js),0x4e4f534a)+js+struct.pack('<II',len(blob),0x004e4942)+blob
 open('public/models/'+sex+'.glb','wb').write(out)
 print(sex,len(faces),'triangles',len(out),'bytes', 'bounds',lo,hi)
# Subtle pore relief and colour variation; not represented as scanned textures.
rng=np.random.default_rng(21);noise=rng.normal(0,1,(512,512));normal=np.zeros((512,512,3),dtype=np.uint8);normal[:,:,0]=np.clip(128+noise*9,0,255);normal[:,:,1]=np.clip(128+np.roll(noise,1,0)*9,0,255);normal[:,:,2]=253
Image.fromarray(normal).save('public/models/skin-normal.png')
albedo=np.zeros((512,512,3),dtype=np.uint8)
for c,val in enumerate([193,148,120]):albedo[:,:,c]=np.clip(val+noise*1.8,0,255)
Image.fromarray(albedo).save('public/models/skin-albedo.jpg',quality=90)
json.dump({'names':names,'colors':colors},open('/tmp/region-colors.json','w'))
