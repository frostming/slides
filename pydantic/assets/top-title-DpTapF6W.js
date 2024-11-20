import{I as d,o as r,b as i,e as t,A as o,x as u,P as c,i as p,f as n,g as v}from"./modules/vue-BE8wNe3U.js";import{u as g}from"./slidev/context-CbpXoCko.js";import{c as y}from"./layoutHelper-HtdtuDyr.js";const w={key:0,class:"slidev-layout default error"},h={key:1},k={class:"flex flex-col h-full w-full"},T={class:"slidev-layout toptitle content h-fit w-full"},$={key:0,class:"slidev-layout default h-fit w-full"},S={__name:"top-title",props:{color:{default:"light"},align:{default:"l"}},setup(m){g();const l=m,a=d(()=>y(l.align)),f=d(()=>`neversink-${l.color}-scheme`);return(s,e)=>a.value=="error"?(r(),i("div",w,[e[7]||(e[7]=t("span",{class:"ns-c-warning"},[t("b",null,"Error"),o(": invalid layout params.")],-1)),e[8]||(e[8]=t("hr",null,null,-1)),t("p",null,[e[0]||(e[0]=o(" There are two parameters: ")),e[1]||(e[1]=t("code",null,"color",-1)),e[2]||(e[2]=o()),e[3]||(e[3]=t("code",null,"align",-1)),e[4]||(e[4]=o(". Currently: ")),t("code",null,"color: "+u(l.color),1),e[5]||(e[5]=o(" and ")),t("code",null,"align: "+u(l.align),1),e[6]||(e[6]=o(". "))]),e[9]||(e[9]=c("<p> The &quot;slots&quot; of the page are <code>:: title ::</code>, <code>:: content ::</code>, and the implicit default slot </p><p> The <code>align</code> parameter determines how the title is aligned. The letter is (<code>c</code> for center, <code>l</code> for left, <code>r</code> for right). </p><p>The <code>color</code> parameter determines color of the title.</p>",3))])):(r(),i("div",h,[t("div",k,[t("div",{class:p(["w-full h-fit min-h-13 pt-2 pb-2 slidecolor",f.value])},[t("div",{class:p(["slidev-layout toptitle title p-0 pt-0 ml-6 mr-6 mt-auto mb-auto",a.value])},[n(s.$slots,"title")],2)],2),t("div",T,[n(s.$slots,"content")]),s.$slots.default?(r(),i("div",$,[n(s.$slots,"default")])):v("v-if",!0)])]))}};export{S as _};
