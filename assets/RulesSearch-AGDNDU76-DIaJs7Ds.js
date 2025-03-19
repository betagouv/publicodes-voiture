import{u as de,r as O,D as fe,j as w,R as ge,a as N}from"./index-HorgIjLO.js";function _(t){return Array.isArray?Array.isArray(t):ne(t)==="[object Array]"}const pe=1/0;function me(t){if(typeof t=="string")return t;let e=t+"";return e=="0"&&1/t==-pe?"-0":e}function xe(t){return t==null?"":me(t)}function y(t){return typeof t=="string"}function se(t){return typeof t=="number"}function Me(t){return t===!0||t===!1||Ee(t)&&ne(t)=="[object Boolean]"}function re(t){return typeof t=="object"}function Ee(t){return re(t)&&t!==null}function m(t){return t!=null}function W(t){return!t.trim().length}function ne(t){return t==null?t===void 0?"[object Undefined]":"[object Null]":Object.prototype.toString.call(t)}const ye="Incorrect 'index' type",Ie=t=>`Invalid value for key ${t}`,_e=t=>`Pattern length exceeds max of ${t}.`,Se=t=>`Missing ${t} property in key`,Ae=t=>`Property 'weight' in key '${t}' must be a positive integer`,J=Object.prototype.hasOwnProperty;class we{constructor(e){this._keys=[],this._keyMap={};let s=0;e.forEach(r=>{let n=ie(r);this._keys.push(n),this._keyMap[n.id]=n,s+=n.weight}),this._keys.forEach(r=>{r.weight/=s})}get(e){return this._keyMap[e]}keys(){return this._keys}toJSON(){return JSON.stringify(this._keys)}}function ie(t){let e=null,s=null,r=null,n=1,i=null;if(y(t)||_(t))r=t,e=Z(t),s=B(t);else{if(!J.call(t,"name"))throw new Error(Se("name"));const c=t.name;if(r=c,J.call(t,"weight")&&(n=t.weight,n<=0))throw new Error(Ae(c));e=Z(c),s=B(c),i=t.getFn}return{path:e,id:s,weight:n,src:r,getFn:i}}function Z(t){return _(t)?t:t.split(".")}function B(t){return _(t)?t.join("."):t}function be(t,e){let s=[],r=!1;const n=(i,c,o)=>{if(m(i))if(!c[o])s.push(i);else{let h=c[o];const a=i[h];if(!m(a))return;if(o===c.length-1&&(y(a)||se(a)||Me(a)))s.push(xe(a));else if(_(a)){r=!0;for(let l=0,d=a.length;l<d;l+=1)n(a[l],c,o+1)}else c.length&&n(a,c,o+1)}};return n(t,y(e)?e.split("."):e,0),r?s:s[0]}const Re={includeMatches:!1,findAllMatches:!1,minMatchCharLength:1},Le={isCaseSensitive:!1,includeScore:!1,keys:[],shouldSort:!0,sortFn:(t,e)=>t.score===e.score?t.idx<e.idx?-1:1:t.score<e.score?-1:1},ve={location:0,threshold:.6,distance:100},Ne={useExtendedSearch:!1,getFn:be,ignoreLocation:!1,ignoreFieldNorm:!1,fieldNormWeight:1};var u={...Le,...Re,...ve,...Ne};const ke=/[^ ]+/g;function Ce(t=1,e=3){const s=new Map,r=Math.pow(10,e);return{get(n){const i=n.match(ke).length;if(s.has(i))return s.get(i);const c=1/Math.pow(i,.5*t),o=parseFloat(Math.round(c*r)/r);return s.set(i,o),o},clear(){s.clear()}}}class Q{constructor({getFn:e=u.getFn,fieldNormWeight:s=u.fieldNormWeight}={}){this.norm=Ce(s,3),this.getFn=e,this.isCreated=!1,this.setIndexRecords()}setSources(e=[]){this.docs=e}setIndexRecords(e=[]){this.records=e}setKeys(e=[]){this.keys=e,this._keysMap={},e.forEach((s,r)=>{this._keysMap[s.id]=r})}create(){this.isCreated||!this.docs.length||(this.isCreated=!0,y(this.docs[0])?this.docs.forEach((e,s)=>{this._addString(e,s)}):this.docs.forEach((e,s)=>{this._addObject(e,s)}),this.norm.clear())}add(e){const s=this.size();y(e)?this._addString(e,s):this._addObject(e,s)}removeAt(e){this.records.splice(e,1);for(let s=e,r=this.size();s<r;s+=1)this.records[s].i-=1}getValueForItemAtKeyId(e,s){return e[this._keysMap[s]]}size(){return this.records.length}_addString(e,s){if(!m(e)||W(e))return;let r={v:e,i:s,n:this.norm.get(e)};this.records.push(r)}_addObject(e,s){let r={i:s,$:{}};this.keys.forEach((n,i)=>{let c=n.getFn?n.getFn(e):this.getFn(e,n.path);if(m(c)){if(_(c)){let o=[];const h=[{nestedArrIndex:-1,value:c}];for(;h.length;){const{nestedArrIndex:a,value:l}=h.pop();if(m(l))if(y(l)&&!W(l)){let d={v:l,i:a,n:this.norm.get(l)};o.push(d)}else _(l)&&l.forEach((d,f)=>{h.push({nestedArrIndex:f,value:d})})}r.$[i]=o}else if(y(c)&&!W(c)){let o={v:c,n:this.norm.get(c)};r.$[i]=o}}}),this.records.push(r)}toJSON(){return{keys:this.keys,records:this.records}}}function ce(t,e,{getFn:s=u.getFn,fieldNormWeight:r=u.fieldNormWeight}={}){const n=new Q({getFn:s,fieldNormWeight:r});return n.setKeys(t.map(ie)),n.setSources(e),n.create(),n}function $e(t,{getFn:e=u.getFn,fieldNormWeight:s=u.fieldNormWeight}={}){const{keys:r,records:n}=t,i=new Q({getFn:e,fieldNormWeight:s});return i.setKeys(r),i.setIndexRecords(n),i}function F(t,{errors:e=0,currentLocation:s=0,expectedLocation:r=0,distance:n=u.distance,ignoreLocation:i=u.ignoreLocation}={}){const c=e/t.length;if(i)return c;const o=Math.abs(r-s);return n?c+o/n:o?1:c}function Oe(t=[],e=u.minMatchCharLength){let s=[],r=-1,n=-1,i=0;for(let c=t.length;i<c;i+=1){let o=t[i];o&&r===-1?r=i:!o&&r!==-1&&(n=i-1,n-r+1>=e&&s.push([r,n]),r=-1)}return t[i-1]&&i-r>=e&&s.push([r,i-1]),s}const v=32;function je(t,e,s,{location:r=u.location,distance:n=u.distance,threshold:i=u.threshold,findAllMatches:c=u.findAllMatches,minMatchCharLength:o=u.minMatchCharLength,includeMatches:h=u.includeMatches,ignoreLocation:a=u.ignoreLocation}={}){if(e.length>v)throw new Error(_e(v));const l=e.length,d=t.length,f=Math.max(0,Math.min(r,d));let g=i,p=f;const x=o>1||h,R=x?Array(d):[];let I;for(;(I=t.indexOf(e,p))>-1;){let M=F(e,{currentLocation:I,expectedLocation:f,distance:n,ignoreLocation:a});if(g=Math.min(M,g),p=I+l,x){let S=0;for(;S<l;)R[I+S]=1,S+=1}}p=-1;let k=[],L=1,j=l+d;const ue=1<<l-1;for(let M=0;M<l;M+=1){let S=0,A=j;for(;S<A;)F(e,{errors:M,currentLocation:f+A,expectedLocation:f,distance:n,ignoreLocation:a})<=g?S=A:j=A,A=Math.floor((j-S)/2+S);j=A;let U=Math.max(1,f-A+1),K=c?d:Math.min(f+A,d)+l,C=Array(K+2);C[K+1]=(1<<M)-1;for(let E=K;E>=U;E-=1){let T=E-1,X=s[t.charAt(T)];if(x&&(R[T]=+!!X),C[E]=(C[E+1]<<1|1)&X,M&&(C[E]|=(k[E+1]|k[E])<<1|1|k[E+1]),C[E]&ue&&(L=F(e,{errors:M,currentLocation:T,expectedLocation:f,distance:n,ignoreLocation:a}),L<=g)){if(g=L,p=T,p<=f)break;U=Math.max(1,2*f-p)}}if(F(e,{errors:M+1,currentLocation:f,expectedLocation:f,distance:n,ignoreLocation:a})>g)break;k=C}const D={isMatch:p>=0,score:Math.max(.001,L)};if(x){const M=Oe(R,o);M.length?h&&(D.indices=M):D.isMatch=!1}return D}function Te(t){let e={};for(let s=0,r=t.length;s<r;s+=1){const n=t.charAt(s);e[n]=(e[n]||0)|1<<r-s-1}return e}class oe{constructor(e,{location:s=u.location,threshold:r=u.threshold,distance:n=u.distance,includeMatches:i=u.includeMatches,findAllMatches:c=u.findAllMatches,minMatchCharLength:o=u.minMatchCharLength,isCaseSensitive:h=u.isCaseSensitive,ignoreLocation:a=u.ignoreLocation}={}){if(this.options={location:s,threshold:r,distance:n,includeMatches:i,findAllMatches:c,minMatchCharLength:o,isCaseSensitive:h,ignoreLocation:a},this.pattern=h?e:e.toLowerCase(),this.chunks=[],!this.pattern.length)return;const l=(f,g)=>{this.chunks.push({pattern:f,alphabet:Te(f),startIndex:g})},d=this.pattern.length;if(d>v){let f=0;const g=d%v,p=d-g;for(;f<p;)l(this.pattern.substr(f,v),f),f+=v;if(g){const x=d-v;l(this.pattern.substr(x),x)}}else l(this.pattern,0)}searchIn(e){const{isCaseSensitive:s,includeMatches:r}=this.options;if(s||(e=e.toLowerCase()),this.pattern===e){let p={isMatch:!0,score:0};return r&&(p.indices=[[0,e.length-1]]),p}const{location:n,distance:i,threshold:c,findAllMatches:o,minMatchCharLength:h,ignoreLocation:a}=this.options;let l=[],d=0,f=!1;this.chunks.forEach(({pattern:p,alphabet:x,startIndex:R})=>{const{isMatch:I,score:k,indices:L}=je(e,p,x,{location:n+R,distance:i,threshold:c,findAllMatches:o,minMatchCharLength:h,includeMatches:r,ignoreLocation:a});I&&(f=!0),d+=k,I&&L&&(l=[...l,...L])});let g={isMatch:f,score:f?d/this.chunks.length:1};return f&&r&&(g.indices=l),g}}class b{constructor(e){this.pattern=e}static isMultiMatch(e){return q(e,this.multiRegex)}static isSingleMatch(e){return q(e,this.singleRegex)}search(){}}function q(t,e){const s=t.match(e);return s?s[1]:null}class Fe extends b{constructor(e){super(e)}static get type(){return"exact"}static get multiRegex(){return/^="(.*)"$/}static get singleRegex(){return/^=(.*)$/}search(e){const s=e===this.pattern;return{isMatch:s,score:s?0:1,indices:[0,this.pattern.length-1]}}}class Pe extends b{constructor(e){super(e)}static get type(){return"inverse-exact"}static get multiRegex(){return/^!"(.*)"$/}static get singleRegex(){return/^!(.*)$/}search(e){const r=e.indexOf(this.pattern)===-1;return{isMatch:r,score:r?0:1,indices:[0,e.length-1]}}}class De extends b{constructor(e){super(e)}static get type(){return"prefix-exact"}static get multiRegex(){return/^\^"(.*)"$/}static get singleRegex(){return/^\^(.*)$/}search(e){const s=e.startsWith(this.pattern);return{isMatch:s,score:s?0:1,indices:[0,this.pattern.length-1]}}}class Ke extends b{constructor(e){super(e)}static get type(){return"inverse-prefix-exact"}static get multiRegex(){return/^!\^"(.*)"$/}static get singleRegex(){return/^!\^(.*)$/}search(e){const s=!e.startsWith(this.pattern);return{isMatch:s,score:s?0:1,indices:[0,e.length-1]}}}class We extends b{constructor(e){super(e)}static get type(){return"suffix-exact"}static get multiRegex(){return/^"(.*)"\$$/}static get singleRegex(){return/^(.*)\$$/}search(e){const s=e.endsWith(this.pattern);return{isMatch:s,score:s?0:1,indices:[e.length-this.pattern.length,e.length-1]}}}class Be extends b{constructor(e){super(e)}static get type(){return"inverse-suffix-exact"}static get multiRegex(){return/^!"(.*)"\$$/}static get singleRegex(){return/^!(.*)\$$/}search(e){const s=!e.endsWith(this.pattern);return{isMatch:s,score:s?0:1,indices:[0,e.length-1]}}}class ae extends b{constructor(e,{location:s=u.location,threshold:r=u.threshold,distance:n=u.distance,includeMatches:i=u.includeMatches,findAllMatches:c=u.findAllMatches,minMatchCharLength:o=u.minMatchCharLength,isCaseSensitive:h=u.isCaseSensitive,ignoreLocation:a=u.ignoreLocation}={}){super(e),this._bitapSearch=new oe(e,{location:s,threshold:r,distance:n,includeMatches:i,findAllMatches:c,minMatchCharLength:o,isCaseSensitive:h,ignoreLocation:a})}static get type(){return"fuzzy"}static get multiRegex(){return/^"(.*)"$/}static get singleRegex(){return/^(.*)$/}search(e){return this._bitapSearch.searchIn(e)}}class he extends b{constructor(e){super(e)}static get type(){return"include"}static get multiRegex(){return/^'"(.*)"$/}static get singleRegex(){return/^'(.*)$/}search(e){let s=0,r;const n=[],i=this.pattern.length;for(;(r=e.indexOf(this.pattern,s))>-1;)s=r+i,n.push([r,s-1]);const c=!!n.length;return{isMatch:c,score:c?0:1,indices:n}}}const z=[Fe,he,De,Ke,Be,We,Pe,ae],ee=z.length,ze=/ +(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/,He="|";function Ve(t,e={}){return t.split(He).map(s=>{let r=s.trim().split(ze).filter(i=>i&&!!i.trim()),n=[];for(let i=0,c=r.length;i<c;i+=1){const o=r[i];let h=!1,a=-1;for(;!h&&++a<ee;){const l=z[a];let d=l.isMultiMatch(o);d&&(n.push(new l(d,e)),h=!0)}if(!h)for(a=-1;++a<ee;){const l=z[a];let d=l.isSingleMatch(o);if(d){n.push(new l(d,e));break}}}return n})}const Ye=new Set([ae.type,he.type]);class Ge{constructor(e,{isCaseSensitive:s=u.isCaseSensitive,includeMatches:r=u.includeMatches,minMatchCharLength:n=u.minMatchCharLength,ignoreLocation:i=u.ignoreLocation,findAllMatches:c=u.findAllMatches,location:o=u.location,threshold:h=u.threshold,distance:a=u.distance}={}){this.query=null,this.options={isCaseSensitive:s,includeMatches:r,minMatchCharLength:n,findAllMatches:c,ignoreLocation:i,location:o,threshold:h,distance:a},this.pattern=s?e:e.toLowerCase(),this.query=Ve(this.pattern,this.options)}static condition(e,s){return s.useExtendedSearch}searchIn(e){const s=this.query;if(!s)return{isMatch:!1,score:1};const{includeMatches:r,isCaseSensitive:n}=this.options;e=n?e:e.toLowerCase();let i=0,c=[],o=0;for(let h=0,a=s.length;h<a;h+=1){const l=s[h];c.length=0,i=0;for(let d=0,f=l.length;d<f;d+=1){const g=l[d],{isMatch:p,indices:x,score:R}=g.search(e);if(p){if(i+=1,o+=R,r){const I=g.constructor.type;Ye.has(I)?c=[...c,...x]:c.push(x)}}else{o=0,i=0,c.length=0;break}}if(i){let d={isMatch:!0,score:o/i};return r&&(d.indices=c),d}}return{isMatch:!1,score:1}}}const H=[];function Qe(...t){H.push(...t)}function V(t,e){for(let s=0,r=H.length;s<r;s+=1){let n=H[s];if(n.condition(t,e))return new n(t,e)}return new oe(t,e)}const P={AND:"$and",OR:"$or"},Y={PATH:"$path",PATTERN:"$val"},G=t=>!!(t[P.AND]||t[P.OR]),Ue=t=>!!t[Y.PATH],Xe=t=>!_(t)&&re(t)&&!G(t),te=t=>({[P.AND]:Object.keys(t).map(e=>({[e]:t[e]}))});function le(t,e,{auto:s=!0}={}){const r=n=>{let i=Object.keys(n);const c=Ue(n);if(!c&&i.length>1&&!G(n))return r(te(n));if(Xe(n)){const h=c?n[Y.PATH]:i[0],a=c?n[Y.PATTERN]:n[h];if(!y(a))throw new Error(Ie(h));const l={keyId:B(h),pattern:a};return s&&(l.searcher=V(a,e)),l}let o={children:[],operator:i[0]};return i.forEach(h=>{const a=n[h];_(a)&&a.forEach(l=>{o.children.push(r(l))})}),o};return G(t)||(t=te(t)),r(t)}function Je(t,{ignoreFieldNorm:e=u.ignoreFieldNorm}){t.forEach(s=>{let r=1;s.matches.forEach(({key:n,norm:i,score:c})=>{const o=n?n.weight:null;r*=Math.pow(c===0&&o?Number.EPSILON:c,(o||1)*(e?1:i))}),s.score=r})}function Ze(t,e){const s=t.matches;e.matches=[],m(s)&&s.forEach(r=>{if(!m(r.indices)||!r.indices.length)return;const{indices:n,value:i}=r;let c={indices:n,value:i};r.key&&(c.key=r.key.src),r.idx>-1&&(c.refIndex=r.idx),e.matches.push(c)})}function qe(t,e){e.score=t.score}function et(t,e,{includeMatches:s=u.includeMatches,includeScore:r=u.includeScore}={}){const n=[];return s&&n.push(Ze),r&&n.push(qe),t.map(i=>{const{idx:c}=i,o={item:e[c],refIndex:c};return n.length&&n.forEach(h=>{h(i,o)}),o})}class ${constructor(e,s={},r){this.options={...u,...s},this.options.useExtendedSearch,this._keyStore=new we(this.options.keys),this.setCollection(e,r)}setCollection(e,s){if(this._docs=e,s&&!(s instanceof Q))throw new Error(ye);this._myIndex=s||ce(this.options.keys,this._docs,{getFn:this.options.getFn,fieldNormWeight:this.options.fieldNormWeight})}add(e){m(e)&&(this._docs.push(e),this._myIndex.add(e))}remove(e=()=>!1){const s=[];for(let r=0,n=this._docs.length;r<n;r+=1){const i=this._docs[r];e(i,r)&&(this.removeAt(r),r-=1,n-=1,s.push(i))}return s}removeAt(e){this._docs.splice(e,1),this._myIndex.removeAt(e)}getIndex(){return this._myIndex}search(e,{limit:s=-1}={}){const{includeMatches:r,includeScore:n,shouldSort:i,sortFn:c,ignoreFieldNorm:o}=this.options;let h=y(e)?y(this._docs[0])?this._searchStringList(e):this._searchObjectList(e):this._searchLogical(e);return Je(h,{ignoreFieldNorm:o}),i&&h.sort(c),se(s)&&s>-1&&(h=h.slice(0,s)),et(h,this._docs,{includeMatches:r,includeScore:n})}_searchStringList(e){const s=V(e,this.options),{records:r}=this._myIndex,n=[];return r.forEach(({v:i,i:c,n:o})=>{if(!m(i))return;const{isMatch:h,score:a,indices:l}=s.searchIn(i);h&&n.push({item:i,idx:c,matches:[{score:a,value:i,norm:o,indices:l}]})}),n}_searchLogical(e){const s=le(e,this.options),r=(o,h,a)=>{if(!o.children){const{keyId:d,searcher:f}=o,g=this._findMatches({key:this._keyStore.get(d),value:this._myIndex.getValueForItemAtKeyId(h,d),searcher:f});return g&&g.length?[{idx:a,item:h,matches:g}]:[]}const l=[];for(let d=0,f=o.children.length;d<f;d+=1){const g=o.children[d],p=r(g,h,a);if(p.length)l.push(...p);else if(o.operator===P.AND)return[]}return l},n=this._myIndex.records,i={},c=[];return n.forEach(({$:o,i:h})=>{if(m(o)){let a=r(s,o,h);a.length&&(i[h]||(i[h]={idx:h,item:o,matches:[]},c.push(i[h])),a.forEach(({matches:l})=>{i[h].matches.push(...l)}))}}),c}_searchObjectList(e){const s=V(e,this.options),{keys:r,records:n}=this._myIndex,i=[];return n.forEach(({$:c,i:o})=>{if(!m(c))return;let h=[];r.forEach((a,l)=>{h.push(...this._findMatches({key:a,value:c[l],searcher:s}))}),h.length&&i.push({idx:o,item:c,matches:h})}),i}_findMatches({key:e,value:s,searcher:r}){if(!m(s))return[];let n=[];if(_(s))s.forEach(({v:i,i:c,n:o})=>{if(!m(i))return;const{isMatch:h,score:a,indices:l}=r.searchIn(i);h&&n.push({score:a,key:e,value:i,idx:c,norm:o,indices:l})});else{const{v:i,n:c}=s,{isMatch:o,score:h,indices:a}=r.searchIn(i);o&&n.push({score:h,key:e,value:i,norm:c,indices:a})}return n}}$.version="7.0.0";$.createIndex=ce;$.parseIndex=$e;$.config=u;$.parseQuery=le;Qe(Ge);function lt(){const t=de(),e=O.useContext(fe),s=Object.entries(t.getParsedRules()).map(([a,l])=>{var d;return{name:a,title:(d=l==null?void 0:l.rawNode)==null?void 0:d.titre}}),[r,n]=O.useState([]),[i,c]=O.useState(""),o=new $(s,{keys:["title","name"]});O.useEffect(()=>{c("")},[e]),O.useEffect(()=>{const a=o.search(i,{limit:10});n(a.map(l=>l.item))},[i]);const h=r.length===0;return w.jsxs(tt,{id:"documentation-search",children:[w.jsx(st,{id:"documentation-search-input",type:"text",placeholder:"Chercher une règle",value:i,onChange:a=>c(a.target.value),onFocus:a=>c(a.target.value),empty:h}),h?null:w.jsx(rt,{id:"documentation-search-results",children:r.map(({name:a,title:l},d)=>w.jsx(nt,{id:"documentation-search-item",isLast:d===r.length-1,onClick:()=>c(""),children:w.jsx(ge,{dottedName:a,children:w.jsxs(it,{onClick:()=>c(""),children:[w.jsx(ct,{id:"documentation-search-item-name",children:a}),w.jsx(ot,{id:"documentation-search-item-title",children:l})]})})},a))})]})}var tt=N.div`
	margin-bottom: 1rem;
	margin-right: 1rem;
	max-width: 350px;
`,st=N.input`
	width: 100%;
	padding: 0.5rem;
	border: 1px solid #ccc;
	border-radius: ${({empty:t})=>t?"5px":"5px 5px 0 0"};

	&:focus {
		outline: none;
		border: 1px solid #666;
	}
`,rt=N.div`
	background-color: white;
	border: 1px solid #ccc;
	border-top: none;
	border-radius: 0 0 0.25rem 0.25rem;
	position: relative;
`,nt=N.div`
	padding: 0.5rem;
	border-bottom: ${({isLast:t})=>t?"none":"1px solid #e6e6e6"};
	border-left: 2px solid transparent;
	border-radius: ${({isLast:t})=>t?"0 0 0.25rem 0.25rem":"0"};

	&:hover {
		background-color: #f6f6f6;
	}
`,it=N.span`
	display: flex;
	flex-wrap: wrap;
	flex-gap: 0.5rem;
	align-items: center;
`,ct=N.span`
	width: 100%;
`,ot=N.span`
	color: #666;
`;export{lt as default};
