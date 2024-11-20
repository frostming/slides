import{g as H,h as L,y as V,z as q}from"../modules/unplugin-icons-DVVdufWY.js";import{d as D,o as n,c,i as E,B as e,t as z,I as b,O as $,X as j,H as A,W as O,a0 as X,a1 as J,b as k,e as t,l as o,k as g,h as N,g as K,x as Q,F as U}from"../modules/vue-BE8wNe3U.js";import{l as Y,k as Z,y as ee,q as te,s as se,z as oe,o as ne,A as ae,B as re,D as le,E as ie,G as ce,_ as ue}from"../index-D_hQlov-.js";import{c as de,u as me,b as F,S as pe}from"./SlideWrapper-Dg6I5Sci.js";import{r as _e,u as fe,a as xe,S as ve,_ as ke,G as ge,b as ye,c as be,o as Ce}from"./shortcuts-DOhEthGp.js";import{_ as he,C as we}from"./NoteDisplay.vue_vue_type_style_index_0_lang-Deunq9p6.js";import{_ as Se}from"./DrawingControls.vue_vue_type_style_index_0_lang-CFj5RmdE.js";import{_ as B}from"./IconButton.vue_vue_type_script_setup_true_lang-DIegAXYh.js";import"../modules/shiki-D2qp-wyq.js";import"./context-CbpXoCko.js";const ze=D({__name:"NoteStatic",props:{no:{},class:{},clicksContext:{}},setup(C){const i=C,{info:l}=de(i.no);return(u,p)=>{var _,f;return n(),c(he,{class:E(i.class),note:(_=e(l))==null?void 0:_.note,"note-html":(f=e(l))==null?void 0:f.noteHTML,"clicks-context":u.clicksContext},null,8,["class","note","note-html","clicks-context"])}}}),$e={class:"bg-main h-full slidev-presenter"},Ne={class:"relative grid-section next flex flex-col p-2 lg:p-4"},Fe={key:1,class:"h-full flex justify-center items-center"},Be={key:0,class:"grid-section note of-auto"},De={key:1,class:"grid-section note grid grid-rows-[1fr_min-content] overflow-hidden"},Ee={class:"border-t border-main py-1 px-2 text-sm"},Me={class:"grid-section bottom flex"},Pe={class:"text-2xl pl-2 pr-6 my-auto tabular-nums"},Ie={class:"progress-bar"},Re=D({__name:"presenter",setup(C){const i=z();_e(),fe(i),xe();const{clicksContext:l,currentSlideNo:u,currentSlideRoute:p,hasNext:_,nextRoute:f,slides:M,getPrimaryClicks:P,total:I}=Y(),{isDrawing:R}=me();Z({title:`Presenter - ${ne}`}),z(!1);const{timer:T,resetTimer:h}=ee(),W=b(()=>M.value.map(v=>te(v))),a=b(()=>l.value.current<l.value.total?[p.value,l.value.current+1]:_.value?[f.value,0]:null),x=b(()=>a.value&&W.value[a.value[0].no-1]);$(a,()=>{x.value&&a.value&&(x.value.current=a.value[1])},{immediate:!0});const w=j();return A(()=>{const v=i.value.querySelector("#slide-content"),s=O(X()),y=J();$(()=>{if(!y.value||R.value||!oe.value)return;const r=v.getBoundingClientRect(),d=(s.x-r.left)/r.width*100,m=(s.y-r.top)/r.height*100;if(!(d<0||d>100||m<0||m>100))return{x:d,y:m}},r=>{se.cursor=r})}),(v,s)=>{var S;const y=H,r=L,d=V,m=q;return n(),k(U,null,[t("div",$e,[t("div",{class:E(["grid-container",`layout${e(ae)}`])},[t("div",{ref_key:"main",ref:i,class:"relative grid-section main flex flex-col"},[o(F,{key:"main",class:"p-2 lg:p-4 flex-auto","is-main":"",onContextmenu:e(Ce)},{default:g(()=>[o(ve,{"render-context":"presenter"})]),_:1},8,["onContextmenu"]),(n(),c(we,{key:(S=e(p))==null?void 0:S.no,"clicks-context":e(P)(e(p)),class:"w-full pb2 px4 flex-none"},null,8,["clicks-context"])),s[3]||(s[3]=t("div",{class:"absolute left-0 top-0 bg-main border-b border-r border-main px2 py1 op50 text-sm"}," Current ",-1))],512),t("div",Ne,[a.value&&x.value?(n(),c(F,{key:"next"},{default:g(()=>[(n(),c(pe,{key:a.value[0].no,"clicks-context":x.value,route:a.value[0],"render-context":"previewNext"},null,8,["clicks-context","route"]))]),_:1})):(n(),k("div",Fe,s[4]||(s[4]=[t("div",{class:"text-gray-500"}," End of the presentation ",-1)]))),s[5]||(s[5]=t("div",{class:"absolute left-0 top-0 bg-main border-b border-r border-main px2 py1 op50 text-sm"}," Next ",-1))]),w.value&&e(re)?(n(),k("div",Be,[o(e(w))])):(n(),k("div",De,[(n(),c(ze,{key:`static-${e(u)}`,no:e(u),class:"w-full max-w-full h-full overflow-auto p-2 lg:p-4",style:N({fontSize:`${e(le)}em`}),"clicks-context":e(l)},null,8,["no","style","clicks-context"])),t("div",Ee,[o(B,{title:"Increase font size",onClick:e(ie)},{default:g(()=>[o(y)]),_:1},8,["onClick"]),o(B,{title:"Decrease font size",onClick:e(ce)},{default:g(()=>[o(r)]),_:1},8,["onClick"]),K("v-if",!0)])])),t("div",Me,[o(ke,{persist:!0}),s[6]||(s[6]=t("div",{"flex-auto":""},null,-1)),t("div",{class:"timer-btn my-auto relative w-22px h-22px cursor-pointer text-lg",opacity:"50 hover:100",onClick:s[2]||(s[2]=(...G)=>e(h)&&e(h)(...G))},[o(d,{class:"absolute"}),o(m,{class:"absolute opacity-0"})]),t("div",Pe,Q(e(T)),1)]),(n(),c(Se,{key:2}))],2),t("div",Ie,[t("div",{class:"progress h-3px bg-primary transition-all",style:N({width:`${(e(u)-1)/(e(I)-1)*100+1}%`})},null,4)])]),o(ge),o(ye),o(be)],64)}}}),Xe=ue(Re,[["__scopeId","data-v-b7c8314e"]]);export{Xe as default};
