var qe=Object.defineProperty;var se=Object.getOwnPropertySymbols;var Ce=Object.prototype.hasOwnProperty,Re=Object.prototype.propertyIsEnumerable;var oe=(s,e,n)=>e in s?qe(s,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):s[e]=n,G=(s,e)=>{for(var n in e||(e={}))Ce.call(e,n)&&oe(s,n,e[n]);if(se)for(var n of se(e))Re.call(e,n)&&oe(s,n,e[n]);return s};import{S as E,i as D,s as U,c as B,e as g,a as P,b as p,d as m,f as $,u as V,g as F,h as W,t as b,j as w,k as h,l as k,m as S,n as T,o as z,p as Ie,q as A,r as j,v as x,w as K,T as we,x as He,y as ze,z as Oe,A as ye,B as re,C as ve,D as N,E as J,F as Q,G as je,H as ke,I as Se,J as Te,K as Ge,L as Pe,M as Be,N as Ae,O as Ne,P as Ve,Q as Fe,R as O,U as We}from"./vendor.a175a128.js";const Ye=function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const l of document.querySelectorAll('link[rel="modulepreload"]'))t(l);new MutationObserver(l=>{for(const o of l)if(o.type==="childList")for(const r of o.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&t(r)}).observe(document,{childList:!0,subtree:!0});function n(l){const o={};return l.integrity&&(o.integrity=l.integrity),l.referrerpolicy&&(o.referrerPolicy=l.referrerpolicy),l.crossorigin==="use-credentials"?o.credentials="include":l.crossorigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function t(l){if(l.ep)return;l.ep=!0;const o=n(l);fetch(l.href,o)}};Ye();const xe=s=>({}),ie=s=>({});function Ke(s){let e,n,t,l;const o=s[1].inline,r=B(o,s,s[0],ie),i=s[1].default,a=B(i,s,s[0],null);return{c(){e=g("div"),r&&r.c(),n=P(),t=g("div"),a&&a.c(),p(t,"class","absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-center"),p(e,"class","relative w-full h-full")},m(u,f){m(u,e,f),r&&r.m(e,null),$(e,n),$(e,t),a&&a.m(t,null),l=!0},p(u,[f]){r&&r.p&&(!l||f&1)&&V(r,o,u,u[0],l?W(o,u[0],f,xe):F(u[0]),ie),a&&a.p&&(!l||f&1)&&V(a,i,u,u[0],l?W(i,u[0],f,null):F(u[0]),null)},i(u){l||(b(r,u),b(a,u),l=!0)},o(u){w(r,u),w(a,u),l=!1},d(u){u&&h(e),r&&r.d(u),a&&a.d(u)}}}function Je(s,e,n){let{$$slots:t={},$$scope:l}=e;return s.$$set=o=>{"$$scope"in o&&n(0,l=o.$$scope)},[l,t]}class te extends E{constructor(e){super();D(this,e,Je,Ke,U,{})}}function Qe(s){let e,n,t,l,o;return{c(){e=g("span"),n=P(),t=g("br"),l=P(),o=g("span"),o.textContent="Loading\u2026",p(e,"class","loader svelte-gg29y1"),p(o,"class","font-extrabold")},m(r,i){m(r,e,i),m(r,n,i),m(r,t,i),m(r,l,i),m(r,o,i)},d(r){r&&h(e),r&&h(n),r&&h(t),r&&h(l),r&&h(o)}}}function Ze(s){let e,n;return e=new te({props:{$$slots:{default:[Qe]},$$scope:{ctx:s}}}),{c(){k(e.$$.fragment)},m(t,l){S(e,t,l),n=!0},p(t,[l]){const o={};l&1&&(o.$$scope={dirty:l,ctx:t}),e.$set(o)},i(t){n||(b(e.$$.fragment,t),n=!0)},o(t){w(e.$$.fragment,t),n=!1},d(t){T(e,t)}}}class Le extends E{constructor(e){super();D(this,e,null,Ze,U,{})}}function Xe(s){let e,n,t,l,o;const r=s[2].default,i=B(r,s,s[1],null);return{c(){e=g("button"),i&&i.c(),p(e,"class",n="bg-blue-600 text-white p-1.5 rounded-2xl hover:bg-blue-700 "+s[0])},m(a,u){m(a,e,u),i&&i.m(e,null),t=!0,l||(o=z(e,"click",s[3]),l=!0)},p(a,[u]){i&&i.p&&(!t||u&2)&&V(i,r,a,a[1],t?W(r,a[1],u,null):F(a[1]),null),(!t||u&1&&n!==(n="bg-blue-600 text-white p-1.5 rounded-2xl hover:bg-blue-700 "+a[0]))&&p(e,"class",n)},i(a){t||(b(i,a),t=!0)},o(a){w(i,a),t=!1},d(a){a&&h(e),i&&i.d(a),l=!1,o()}}}function et(s,e,n){let{$$slots:t={},$$scope:l}=e,{class:o=""}=e;function r(i){Ie.call(this,s,i)}return s.$$set=i=>{"class"in i&&n(0,o=i.class),"$$scope"in i&&n(1,l=i.$$scope)},[o,l,t,r]}class ee extends E{constructor(e){super();D(this,e,et,Xe,U,{class:0})}}function tt(s){let e=s[0]?"Authorize":"Sign in",n;return{c(){n=A(e)},m(t,l){m(t,n,l)},p(t,l){l&1&&e!==(e=t[0]?"Authorize":"Sign in")&&j(n,e)},d(t){t&&h(n)}}}function nt(s){let e,n,t=s[0]?"authorize this app":"sign in",l,o,r,i,a,u,f;return u=new ee({props:{class:"w-full",$$slots:{default:[tt]},$$scope:{ctx:s}}}),u.$on("click",st),{c(){e=g("p"),n=A("Please "),l=A(t),o=A(" to continue"),r=P(),i=g("br"),a=P(),k(u.$$.fragment)},m(d,c){m(d,e,c),$(e,n),$(e,l),$(e,o),m(d,r,c),m(d,i,c),m(d,a,c),S(u,d,c),f=!0},p(d,c){(!f||c&1)&&t!==(t=d[0]?"authorize this app":"sign in")&&j(l,t);const v={};c&3&&(v.$$scope={dirty:c,ctx:d}),u.$set(v)},i(d){f||(b(u.$$.fragment,d),f=!0)},o(d){w(u.$$.fragment,d),f=!1},d(d){d&&h(e),d&&h(r),d&&h(i),d&&h(a),T(u,d)}}}function lt(s){let e,n;return e=new te({props:{$$slots:{default:[nt]},$$scope:{ctx:s}}}),{c(){k(e.$$.fragment)},m(t,l){S(e,t,l),n=!0},p(t,[l]){const o={};l&3&&(o.$$scope={dirty:l,ctx:t}),e.$set(o)},i(t){n||(b(e.$$.fragment,t),n=!0)},o(t){w(e.$$.fragment,t),n=!1},d(t){T(e,t)}}}function st(){return gapi.auth2.getAuthInstance().signIn()}function ot(s,e,n){let{isSignedIn:t}=e;return s.$$set=l=>{"isSignedIn"in l&&n(0,t=l.isSignedIn)},[t]}class rt extends E{constructor(e){super();D(this,e,ot,lt,U,{isSignedIn:0})}}function it(s){let e;return{c(){e=g("a"),e.textContent="Youtube Video Deck",p(e,"class","font-extrabold"),p(e,"href","#")},m(n,t){m(n,e,t)},d(n){n&&h(e)}}}function ae(s){let e,n,t,l;return e=new ee({props:{class:"w-36 m-1",$$slots:{default:[at]},$$scope:{ctx:s}}}),e.$on("click",pt),t=new ee({props:{class:"w-36 m-1",$$slots:{default:[ut]},$$scope:{ctx:s}}}),t.$on("click",dt),{c(){k(e.$$.fragment),n=P(),k(t.$$.fragment)},m(o,r){S(e,o,r),m(o,n,r),S(t,o,r),l=!0},p(o,r){const i={};r&2&&(i.$$scope={dirty:r,ctx:o}),e.$set(i);const a={};r&2&&(a.$$scope={dirty:r,ctx:o}),t.$set(a)},i(o){l||(b(e.$$.fragment,o),b(t.$$.fragment,o),l=!0)},o(o){w(e.$$.fragment,o),w(t.$$.fragment,o),l=!1},d(o){T(e,o),o&&h(n),T(t,o)}}}function at(s){let e;return{c(){e=A("Sign out")},m(n,t){m(n,e,t)},d(n){n&&h(e)}}}function ut(s){let e;return{c(){e=A("Revoke access")},m(n,t){m(n,e,t)},d(n){n&&h(e)}}}function ct(s){let e,n,t=s[0]&&ae(s);return{c(){e=g("div"),t&&t.c(),p(e,"slot","inline"),p(e,"class","float-right p-1")},m(l,o){m(l,e,o),t&&t.m(e,null),n=!0},p(l,o){l[0]?t?(t.p(l,o),o&1&&b(t,1)):(t=ae(l),t.c(),b(t,1),t.m(e,null)):t&&(x(),w(t,1,1,()=>{t=null}),K())},i(l){n||(b(t),n=!0)},o(l){w(t),n=!1},d(l){l&&h(e),t&&t.d()}}}function ft(s){let e,n,t;return n=new te({props:{$$slots:{inline:[ct],default:[it]},$$scope:{ctx:s}}}),{c(){e=g("header"),k(n.$$.fragment),p(e,"class","h-12")},m(l,o){m(l,e,o),S(n,e,null),t=!0},p(l,[o]){const r={};o&3&&(r.$$scope={dirty:o,ctx:l}),n.$set(r)},i(l){t||(b(n.$$.fragment,l),t=!0)},o(l){w(n.$$.fragment,l),t=!1},d(l){l&&h(e),T(n)}}}function pt(){gapi.auth2.getAuthInstance().signOut()}function dt(){gapi.auth2.getAuthInstance().disconnect()}function mt(s,e,n){let{isSignedIn:t}=e;return s.$$set=l=>{"isSignedIn"in l&&n(0,t=l.isSignedIn)},[t]}class ht extends E{constructor(e){super();D(this,e,mt,ft,U,{isSignedIn:0})}}function gt(s){return{title:s.snippet.title,description:s.snippet.description.substring(0,313),publishedAt:s.snippet.publishedAt,thumbnailUrl:s.snippet.thumbnails.medium.url,videoId:s.snippet.resourceId.videoId}}function _t(s,e){return{channelId:s.snippet.resourceId.channelId,title:s.snippet.title,uploadsPlaylistId:e.contentDetails.relatedPlaylists.uploads,uploads:[]}}function $t(s,e){s.uploadsEtag==null&&(s.uploadsEtag=e.etag),s.nextUploadPageToken=e.nextPageToken,e.items.forEach(n=>s.uploads.push(gt(n)))}function bt(s){s.uploadsEtag=null,s.nextUploadPageToken=null,s.uploads=[]}function It(s,e){return{etag:s.etag,items:s.items.flatMap(n=>n.map(t=>{const l=e.get(t.snippet.resourceId.channelId);return _t(t,l)}))}}we.addDefaultLocale(He);const ue=new we("en-US"),ce=ze(ye(),Oe(),"subscriptions"),Y=ye();function wt(s){let e,n,t,l,o,r,i,a=s[0].title+"",u,f,d,c,v=ue.format(new Date(s[0].publishedAt))+"",R,y,L,C=s[0].description+"",_,I,M,le;return{c(){e=g("a"),n=g("div"),t=g("img"),o=P(),r=g("div"),i=g("p"),u=A(a),d=P(),c=g("p"),R=A(v),y=P(),L=g("p"),_=A(C),re(t.src,l=s[0].thumbnailUrl)||p(t,"src",l),p(t,"alt",""),p(t,"width","320"),p(t,"height","180"),p(n,"class","inline-block w-image align-text-bottom p-1 svelte-tmjg5a"),p(i,"class","font-bold w-text truncate-line svelte-tmjg5a"),p(i,"title",f=s[0].title),p(c,"class","text-neutral-400"),p(L,"class","text-ellipsis truncate-lines svelte-tmjg5a"),p(r,"class","inline-block w-text align-top text-sm svelte-tmjg5a"),p(e,"class","block w-card bg-neutral-600 p-2 m-2 rounded-2xl svelte-tmjg5a"),p(e,"href",I="https://www.youtube.com/watch?v="+s[0].videoId)},m(q,H){m(q,e,H),$(e,n),$(n,t),$(e,o),$(e,r),$(r,i),$(i,u),$(r,d),$(r,c),$(c,R),$(r,y),$(r,L),$(L,_),M||(le=z(e,"click",ve(s[1])),M=!0)},p(q,[H]){H&1&&!re(t.src,l=q[0].thumbnailUrl)&&p(t,"src",l),H&1&&a!==(a=q[0].title+"")&&j(u,a),H&1&&f!==(f=q[0].title)&&p(i,"title",f),H&1&&v!==(v=ue.format(new Date(q[0].publishedAt))+"")&&j(R,v),H&1&&C!==(C=q[0].description+"")&&j(_,C),H&1&&I!==(I="https://www.youtube.com/watch?v="+q[0].videoId)&&p(e,"href",I)},i:N,o:N,d(q){q&&h(e),M=!1,le()}}}function yt(s,e,n){let{video:t}=e;function l(){Y.set({videoId:t.videoId})}return s.$$set=o=>{"video"in o&&n(0,t=o.video)},[t,l]}class vt extends E{constructor(e){super();D(this,e,yt,wt,U,{video:0})}}const Ee="Not Modified";function kt(s,e){if(e){const n=new URLSearchParams(e);return`${s}?${n}`}else return s}function Z(s,e={}){const n=kt("https://www.googleapis.com"+s,e.query);return e.headers=new Headers(e.headers),e.headers.append("Authorization","Bearer "+gapi.auth.getToken().access_token),e.etag&&e.headers.append("If-None-Match",e.etag),new Request(n,e)}async function ne(s,e={}){typeof s=="string"&&(s=Z(s,e));const n=await fetch(s);if(n.status===304)throw Ee;if(!n.ok)throw n;return n}async function De(s,e){const n=`boundary${Date.now()}`,t="/batch"+s,l=await ne(t,{method:"POST",headers:{"Content-Type":`multipart/mixed; boundary=${n}`},body:await St(e,n)});return Tt(l)}async function St(s,e){let n=[];for(const[t,l]of s){if(n.push(`--${e}`),n.push("Content-Type: application/http"),n.push(`Content-ID: ${t}`),l.bodyUsed&&n.push(`Content-Length: ${(await l.blob()).size}`),n.push(""),n.push(`${l.method} ${l.url}`),l.headers)for(const[o,r]of l.headers.entries())n.push(`${o}: ${r}`);l.bodyUsed&&(n.push(""),n.push(await l.text()))}return n.push(`--${e}--`),n.join(`\r
`)}async function Tt(s){const e=s.headers.get("Content-Type").match(/^multipart\/mixed; boundary=(.+)$/)[1],t=(await s.text()).split(new RegExp(`\r
--${e}(?:--)?\r
`,"g")).slice(1,-1),l=new Map;for(const o of t){const[r,i,a]=o.split(`\r
\r
`,3),f=fe(r).get("Content-ID").match(/^response-(.+)$/)[1],[d,c]=i.split(`\r
`,2),[v,R,y]=d.split(" ",3),L=fe(c),C=a.length===0?null:a,_=new Response(C,{status:parseInt(R,10),statusText:y,headers:L});l.set(f,_)}return l}function fe(s){const e=new Headers;for(const n of s.split(`\r
`)){const[t,l]=n.split(": ");e.append(t,l)}return e}async function Pt(s){let e=await pe({etag:s});const n=e.etag,t=[e.items];for(;e.nextPageToken;)e=await pe({pageToken:e.nextPageToken}),t.push(e.items);return{etag:n,items:t}}async function pe(s={}){return(await ne(At(s))).json()}function At(s={}){return Z("/youtube/v3/subscriptions",G({method:"GET",query:G({part:"snippet",fields:"etag,items(snippet(title,resourceId/channelId)),nextPageToken",mine:"true",order:"alphabetical",maxResults:"50"},s.pageToken&&{pageToken:s.pageToken})},s.etag&&{etag:s.etag}))}async function Nt(s){const e=new Map(s.map((l,o)=>[`${o}`,Lt(l)])),n=await De("/youtube/v3",e),t=await Promise.all(Array.from(n.values()).map(l=>l.json()));return new Map(t.flatMap(l=>l.items.map(o=>[o.id,o])))}function Lt(s){return Z("/youtube/v3/channels",{method:"GET",query:{part:"contentDetails",fields:"items(id,contentDetails/relatedPlaylists/uploads)",id:s.map(e=>e.snippet.resourceId.channelId).join(","),maxResults:"50"}})}async function Et(s){const e=new Map(s.items.map(t=>[t.uploadsPlaylistId,Ue(t,!0)])),n=await De("/youtube/v3",e);await Promise.all(s.items.map(t=>Me(t,n.get(t.uploadsPlaylistId),!0)))}async function Dt(s){const e=await ne(Ue(s,!1));await Me(s,e,!1)}function Ue(s,e){return Z("/youtube/v3/playlistItems",G({method:"GET",query:G({part:"snippet",fields:"etag,items(snippet(title,description,publishedAt,thumbnails/medium/url,resourceId/videoId)),nextPageToken",playlistId:s.uploadsPlaylistId,maxResults:"50"},!e&&s.nextUploadPageToken&&{pageToken:s.nextUploadPageToken})},e&&s.uploadsEtag&&{etag:s.uploadsEtag}))}async function Me(s,e,n){if(n){if(s.uploadsEtag&&e.status===304)return;bt(s)}if(!e.ok)throw e;$t(s,await e.json())}function de(s,e,n){const t=s.slice();return t[8]=e[n],t}function me(s){let e,n,t,l,o;return{c(){e=g("a"),n=A("\u{1F782}"),p(e,"class","float-right pl-2 pr-2 -ml-8"),p(e,"href",t="https://www.youtube.com/watch?v="+s[1][0].videoId+"&list="+s[0].uploadsPlaylistId)},m(r,i){m(r,e,i),$(e,n),l||(o=z(e,"click",ve(s[2])),l=!0)},p(r,i){i&3&&t!==(t="https://www.youtube.com/watch?v="+r[1][0].videoId+"&list="+r[0].uploadsPlaylistId)&&p(e,"href",t)},d(r){r&&h(e),l=!1,o()}}}function he(s,e){let n,t,l;return t=new vt({props:{video:e[8]}}),{key:s,first:null,c(){n=J(),k(t.$$.fragment),this.first=n},m(o,r){m(o,n,r),S(t,o,r),l=!0},p(o,r){e=o;const i={};r&2&&(i.video=e[8]),t.$set(i)},i(o){l||(b(t.$$.fragment,o),l=!0)},o(o){w(t.$$.fragment,o),l=!1},d(o){o&&h(n),T(t,o)}}}function Ut(s){let e,n,t,l=s[0].title+"",o,r,i,a,u,f=[],d=new Map,c,v,R,y=s[1].length>0&&me(s),L=s[1];const C=_=>_[8].videoId;for(let _=0;_<L.length;_+=1){let I=de(s,L,_),M=C(I);d.set(M,f[_]=he(M,I))}return{c(){e=g("div"),n=g("p"),t=g("a"),o=A(l),i=P(),y&&y.c(),a=P(),u=g("div");for(let _=0;_<f.length;_+=1)f[_].c();p(t,"href",r="https://www.youtube.com/channel/"+s[0].channelId),p(n,"class","text-center font-bold h-8"),p(u,"class","overflow-y-scroll overflow-x-hidden svelte-10twfte"),Q(u,"height","calc(100% - 1.5rem)"),p(e,"class","inline-block h-full bg-neutral-800 p-1 ml-1 mr-1 rounded-2xl svelte-10twfte")},m(_,I){m(_,e,I),$(e,n),$(n,t),$(t,o),$(n,i),y&&y.m(n,null),$(e,a),$(e,u);for(let M=0;M<f.length;M+=1)f[M].m(u,null);c=!0,v||(R=[z(u,"wheel",je(s[4]),{passive:!0}),z(u,"scroll",s[3])],v=!0)},p(_,[I]){(!c||I&1)&&l!==(l=_[0].title+"")&&j(o,l),(!c||I&1&&r!==(r="https://www.youtube.com/channel/"+_[0].channelId))&&p(t,"href",r),_[1].length>0?y?y.p(_,I):(y=me(_),y.c(),y.m(n,null)):y&&(y.d(1),y=null),I&2&&(L=_[1],x(),f=ke(f,I,C,1,_,L,d,u,Se,he,null,de),K())},i(_){if(!c){for(let I=0;I<L.length;I+=1)b(f[I]);c=!0}},o(_){for(let I=0;I<f.length;I+=1)w(f[I]);c=!1},d(_){_&&h(e),y&&y.d();for(let I=0;I<f.length;I+=1)f[I].d();v=!1,Te(R)}}}function Mt(s,e,n){let{subscription:t}=e,l=t.uploads.slice(0,10),o;function r(){Y.set({playlistId:t.uploadsPlaylistId})}function i(d){const c=d.target;c.scrollHeight-c.scrollTop-122<=c.clientHeight&&a()}async function a(){t.uploads.length===l.length&&await u(),t.uploads.length>l.length&&n(1,l=l.concat(t.uploads.slice(l.length,l.length+10)))}async function u(){t.nextUploadPageToken&&t.nextUploadPageToken!==o&&(o=t.nextUploadPageToken,await Dt(t),n(0,t))}function f(d){Ie.call(this,s,d)}return s.$$set=d=>{"subscription"in d&&n(0,t=d.subscription)},[t,l,r,i,f]}class qt extends E{constructor(e){super();D(this,e,Mt,Ut,U,{subscription:0})}}function Ct(s){let e,n,t,l;const o=s[4].default,r=B(o,s,s[3],null);return{c(){e=g("div"),r&&r.c(),p(e,"class","w-full h-full overflow-x-scroll svelte-1ekfizo")},m(i,a){m(i,e,a),r&&r.m(e,null),s[5](e),n=!0,t||(l=[z(e,"wheel",s[1],{passive:!0}),z(e,"scroll",s[2])],t=!0)},p(i,[a]){r&&r.p&&(!n||a&8)&&V(r,o,i,i[3],n?W(o,i[3],a,null):F(i[3]),null)},i(i){n||(b(r,i),n=!0)},o(i){w(r,i),n=!1},d(i){i&&h(e),r&&r.d(i),s[5](null),t=!1,Te(l)}}}const ge=100;function Rt(s,e,n){let{$$slots:t={},$$scope:l}=e,o;const r=Ge(0,{duration:ge});let i=!1,a;Pe(r.subscribe(c=>{i&&n(0,o.scrollLeft=c,o)}));function u(c){c.deltaX||(i=!0,r.update(v=>Math.max(0,Math.min(v+c.deltaY,o.scrollWidth-o.clientWidth))))}function f(){clearTimeout(a),a=setTimeout(()=>{i=!1,r.set(o.scrollLeft,{duration:0})},ge)}function d(c){Be[c?"unshift":"push"](()=>{o=c,n(0,o)})}return s.$$set=c=>{"$$scope"in c&&n(3,l=c.$$scope)},[o,u,f,l,t,d]}class Ht extends E{constructor(e){super();D(this,e,Rt,Ct,U,{})}}function _e(s,e,n){const t=s.slice();return t[4]=e[n],t}function zt(s){let e,n=s[7]+"",t;return{c(){e=g("p"),t=A(n),p(e,"class","text-center")},m(l,o){m(l,e,o),$(e,t)},p:N,i:N,o:N,d(l){l&&h(e)}}}function Ot(s){let e,n,t;return n=new Ht({props:{$$slots:{default:[jt]},$$scope:{ctx:s}}}),{c(){e=g("div"),k(n.$$.fragment),p(e,"class","w-full"),Q(e,"height","calc(100% - 6px)")},m(l,o){m(l,e,o),S(n,e,null),t=!0},p(l,o){const r={};o&256&&(r.$$scope={dirty:o,ctx:l}),n.$set(r)},i(l){t||(b(n.$$.fragment,l),t=!0)},o(l){w(n.$$.fragment,l),t=!1},d(l){l&&h(e),T(n)}}}function $e(s,e){let n,t,l;return t=new qt({props:{subscription:e[4]}}),{key:s,first:null,c(){n=J(),k(t.$$.fragment),this.first=n},m(o,r){m(o,n,r),S(t,o,r),l=!0},p(o,r){e=o},i(o){l||(b(t.$$.fragment,o),l=!0)},o(o){w(t.$$.fragment,o),l=!1},d(o){o&&h(n),T(t,o)}}}function jt(s){let e,n=[],t=new Map,l,o=s[3].items;const r=i=>i[4].uploadsPlaylistId;for(let i=0;i<o.length;i+=1){let a=_e(s,o,i),u=r(a);t.set(u,n[i]=$e(u,a))}return{c(){e=g("div");for(let i=0;i<n.length;i+=1)n[i].c();p(e,"class","w-max h-full")},m(i,a){m(i,e,a);for(let u=0;u<n.length;u+=1)n[u].m(e,null);l=!0},p(i,a){a&1&&(o=i[3].items,x(),n=ke(n,a,r,1,i,o,t,e,Se,$e,null,_e),K())},i(i){if(!l){for(let a=0;a<o.length;a+=1)b(n[a]);l=!0}},o(i){for(let a=0;a<n.length;a+=1)w(n[a]);l=!1},d(i){i&&h(e);for(let a=0;a<n.length;a+=1)n[a].d()}}}function Gt(s){let e,n;return e=new Le({}),{c(){k(e.$$.fragment)},m(t,l){S(e,t,l),n=!0},p:N,i(t){n||(b(e.$$.fragment,t),n=!0)},o(t){w(e.$$.fragment,t),n=!1},d(t){T(e,t)}}}function Bt(s){let e,n,t={ctx:s,current:null,token:null,hasCatch:!0,pending:Gt,then:Ot,catch:zt,value:3,error:7,blocks:[,,,]};return Ae(s[0](),t),{c(){e=J(),t.block.c()},m(l,o){m(l,e,o),t.block.m(l,t.anchor=o),t.mount=()=>e.parentNode,t.anchor=e,n=!0},p(l,[o]){s=l,Ne(t,s,o)},i(l){n||(b(t.block),n=!0)},o(l){for(let o=0;o<3;o+=1){const r=t.blocks[o];w(r)}n=!1},d(l){l&&h(e),t.block.d(l),t.token=null,t=null}}}function Vt(s,e,n){let t;Ve(s,ce,r=>n(1,t=r));async function l(){const r=await o();return await Et(r),Fe(ce,t=r,t),r}async function o(){const r=t;try{const i=await Pt(r==null?void 0:r.etag),a=await Nt(i.items);return It(i,a)}catch(i){if(r&&i===Ee)return r;throw i}}return[l]}class Ft extends E{constructor(e){super();D(this,e,Vt,Bt,U,{})}}function Wt(s){let e,n,t,l;return{c(){e=g("div"),n=g("div"),n.innerHTML='<div id="player"></div>',p(n,"class","fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"),O(n,"invisible",s[0]),p(e,"class","fixed top-0 bottom-0 left-0 right-0 z-10 svelte-v5cnxt"),Q(e,"background-color","rgba(0, 0, 0, 0.8)"),O(e,"fadeIn",!s[0]),O(e,"fadeOut",s[0])},m(o,r){m(o,e,r),$(e,n),t||(l=z(e,"click",We(s[4])),t=!0)},p(o,[r]){r&1&&O(n,"invisible",o[0]),r&1&&O(e,"fadeIn",!o[0]),r&1&&O(e,"fadeOut",o[0])},i:N,o:N,d(o){o&&h(e),t=!1,l()}}}function be(){let s=Math.min(document.body.clientWidth,16*document.body.clientHeight/9),e=Math.min(document.body.clientHeight,9*document.body.clientWidth/16);return s>.9*document.body.clientWidth&&e>.9*document.body.clientHeight&&(s*=.9,e*=.9),[s,e]}function Yt(s,e,n){var t;(function(u){u[u.UNINITIALISED=0]="UNINITIALISED",u[u.INITIALISING=1]="INITIALISING",u[u.INITIALISED=2]="INITIALISED"})(t||(t={}));let l=!0,o,r=t.UNINITIALISED;window.addEventListener("resize",()=>{o&&o.setSize(...be())});function i(u){if(r===t.UNINITIALISED){n(3,r=t.INITIALISING);const[f,d]=be(),c={width:f,height:d,playerVars:{autohide:1,autoplay:1,playsinline:1},events:{onReady:()=>n(3,r=t.INITIALISED),onStateChange:v=>{l&&(v.data===YT.PlayerState.BUFFERING||v.data===YT.PlayerState.PLAYING)&&n(0,l=!1)}}};u.videoId?c.videoId=u.videoId:u.playlistId?(c.playerVars.listType="playlist",c.playerVars.list=u.playlistId):u.customPlaylist&&(c.playerVars.playlist=u.customPlaylist.join(",")),n(2,o=new YT.Player("player",c)),n(0,l=!1)}else r===t.INITIALISING?setTimeout(()=>i(u),100):r===t.INITIALISED&&(u.videoId?o.loadVideoById(u.videoId):u.playlistId?o.loadPlaylist({listType:"playlist",list:u.playlistId}):u.customPlaylist&&o.loadPlaylist(u.customPlaylist))}Pe(Y.subscribe(u=>{u&&(Y.set(null),i(u))}));const a=()=>n(0,l=!0);return s.$$.update=()=>{s.$$.dirty&15&&r===t.INITIALISED&&l&&o.stopVideo()},[l,t,o,r,a]}class xt extends E{constructor(e){super();D(this,e,Yt,Wt,U,{})}}function Kt(s){let e,n=s[5]+"",t;return{c(){e=g("p"),t=A(n),p(e,"class","text-center")},m(l,o){m(l,e,o),$(e,t)},p:N,i:N,o:N,d(l){l&&h(e)}}}function Jt(s){let e,n,t,l;const o=[Zt,Qt],r=[];function i(a,u){return a[1]?0:1}return e=i(s),n=r[e]=o[e](s),{c(){n.c(),t=J()},m(a,u){r[e].m(a,u),m(a,t,u),l=!0},p(a,u){let f=e;e=i(a),e===f?r[e].p(a,u):(x(),w(r[f],1,1,()=>{r[f]=null}),K(),n=r[e],n?n.p(a,u):(n=r[e]=o[e](a),n.c()),b(n,1),n.m(t.parentNode,t))},i(a){l||(b(n),l=!0)},o(a){w(n),l=!1},d(a){r[e].d(a),a&&h(t)}}}function Qt(s){let e,n;return e=new rt({props:{isSignedIn:s[0]}}),{c(){k(e.$$.fragment)},m(t,l){S(e,t,l),n=!0},p(t,l){const o={};l&1&&(o.isSignedIn=t[0]),e.$set(o)},i(t){n||(b(e.$$.fragment,t),n=!0)},o(t){w(e.$$.fragment,t),n=!1},d(t){T(e,t)}}}function Zt(s){let e,n,t,l;return e=new xt({}),t=new Ft({}),{c(){k(e.$$.fragment),n=P(),k(t.$$.fragment)},m(o,r){S(e,o,r),m(o,n,r),S(t,o,r),l=!0},p:N,i(o){l||(b(e.$$.fragment,o),b(t.$$.fragment,o),l=!0)},o(o){w(e.$$.fragment,o),w(t.$$.fragment,o),l=!1},d(o){T(e,o),o&&h(n),T(t,o)}}}function Xt(s){let e,n;return e=new Le({}),{c(){k(e.$$.fragment)},m(t,l){S(e,t,l),n=!0},p:N,i(t){n||(b(e.$$.fragment,t),n=!0)},o(t){w(e.$$.fragment,t),n=!1},d(t){T(e,t)}}}function en(s){let e,n,t,l,o;n=new ht({props:{isSignedIn:s[0]}});let r={ctx:s,current:null,token:null,hasCatch:!0,pending:Xt,then:Jt,catch:Kt,value:4,error:5,blocks:[,,,]};return Ae(s[2](),r),{c(){e=g("main"),k(n.$$.fragment),t=P(),l=g("section"),r.block.c(),Q(l,"height","calc(100% - 3rem)"),p(e,"class","w-screen h-screen bg-neutral-700 text-white")},m(i,a){m(i,e,a),S(n,e,null),$(e,t),$(e,l),r.block.m(l,r.anchor=null),r.mount=()=>l,r.anchor=null,o=!0},p(i,[a]){s=i;const u={};a&1&&(u.isSignedIn=s[0]),n.$set(u),Ne(r,s,a)},i(i){o||(b(n.$$.fragment,i),b(r.block),o=!0)},o(i){w(n.$$.fragment,i);for(let a=0;a<3;a+=1){const u=r.blocks[a];w(u)}o=!1},d(i){i&&h(e),T(n),r.block.d(),r.token=null,r=null}}}const X="https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/drive.appdata";function tn(s,e,n){let t,l;function o(){return new Promise((i,a)=>{gapi.load("client:auth2",()=>r().then(()=>i()).catch(u=>a(u)))})}async function r(){await gapi.client.init({apiKey:"AIzaSyBAHcJ9fPTrCjDExl1NZkF4fZd15fICEFI",clientId:"789354109817-qrqoqtfj1k3gvs01gufrpqlv38g0bi9p.apps.googleusercontent.com",scope:X});const i=gapi.auth2.getAuthInstance();n(0,t=i.isSignedIn.get()),i.isSignedIn.listen(a=>n(0,t=a)),n(1,l=i.currentUser.get().hasGrantedScopes(X)),i.currentUser.listen(a=>n(1,l=a.hasGrantedScopes(X)))}return[t,l,o]}class nn extends E{constructor(e){super();D(this,e,tn,en,U,{})}}new nn({target:document.getElementById("app")});
