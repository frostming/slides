import{Q as g,I as r,o as n,b as u,e as t,A as s,x as f,P as w,i as d,f as i}from"./modules/vue-BE8wNe3U.js";import{u as y}from"./slidev/context-CwVxaRKB.js";import{a as T,c as p}from"./layoutHelper-HtdtuDyr.js";import{_ as k}from"./index-KlKKXNcz.js";const $={key:0,class:"slidev-layout default error"},b={key:1,class:"h-full"},q={key:0,class:"flex h-full w-full"},x={class:"column-content"},I={key:1,class:"flex h-full w-full"},S={class:"column-content"},C={__name:"side-title",props:{side:{default:"l"},color:{default:"light"},titlewidth:{default:"is-one-third"},align:{default:"auto"}},setup(h){g(o=>({"3cf39f41":c.value.l,"3cf39f47":c.value.r})),y();const l=h,v=r(()=>l.side==="left"||l.side==="l"?"left":l.side==="right"||l.side==="r"?"right":"error"),c=r(()=>T(l.titlewidth)),a=r(()=>{let o="";l.align=="auto"&&(l.side==="l"||l.side==="left")?o="rm-lt":l.align=="auto"&&(l.side==="r"||l.side==="right")?o="lt-lm":o=l.align;const e=o.split("-");return{l:p(e[0]),r:p(e[1])}}),m=r(()=>`neversink-${l.color}-scheme`);return(o,e)=>v.value=="error"||c.value=="error"?(n(),u("div",$,[e[10]||(e[10]=t("span",{class:"ns-c-warning"},[t("b",null,"Error"),s(": invalid layout params.")],-1)),e[11]||(e[11]=t("hr",null,null,-1)),t("p",null,[e[0]||(e[0]=s(" There are three parameters: ")),e[1]||(e[1]=t("code",null,"color",-1)),e[2]||(e[2]=s(", ")),e[3]||(e[3]=t("code",null,"columns",-1)),e[4]||(e[4]=s(" and ")),e[5]||(e[5]=t("code",null,"align",-1)),e[6]||(e[6]=s(". Currently: ")),t("code",null,"color: "+f(l.color),1),e[7]||(e[7]=s(", ")),t("code",null,"columns: "+f(l.titlewidth),1),e[8]||(e[8]=s(" and ")),t("code",null,"align: "+f(l.align),1),e[9]||(e[9]=s(". "))]),e[12]||(e[12]=w("<p data-v-448e2194>The &quot;slots&quot; of the page are default and <code data-v-448e2194>:: content ::</code></p><p data-v-448e2194> Options for <code data-v-448e2194>titlewidth</code> are divided into 12 column units. So with <code data-v-448e2194>titlewidth: is-1-11</code> the left column is 1/12 wide and the the right columns is 11/12 wide. The component admits a short had of only specifying the left column (<code data-v-448e2194>titlewidth: is-1</code> does the same thing). In addition there are short hands like <code data-v-448e2194>titlewidth: is-one-quarter</code> which resolves to <code data-v-448e2194>is-3-9</code>, etc... </p><p data-v-448e2194> Here are a bunch of examples: <code data-v-448e2194> is-1, is-2, is-3, is-3-9, is-4-8, is-5-7, is-one-quarter, is-one-third, is-one-half, is-two-thirds, is-three-quarters </code></p><p data-v-448e2194> The <code data-v-448e2194>align</code> parameter determines how the columns look. The notation is for example <code data-v-448e2194>align: cm-cm</code>. The first part for the left column, and the third part is for the right column. The first letter is (<code data-v-448e2194>c</code> for center, <code data-v-448e2194>l</code> for left, <code data-v-448e2194>r</code> for right). This applies to all three second. For the columns the second letter is vertical alignment (<code data-v-448e2194>t</code> for top, <code data-v-448e2194>m</code> for middle, <code data-v-448e2194>b</code> for bottom). </p><p data-v-448e2194>The <code data-v-448e2194>color</code> parameter determines color of the title.</p>",5))])):(n(),u("div",b,[v.value==="left"?(n(),u("div",q,[t("div",{class:d(["slidecolor column-title",m.value])},[t("div",{class:d(["slidev-layout sidetitle w-full p-6",a.value.l])},[i(o.$slots,"title",{},void 0,!0)],2)],2),t("div",x,[t("div",{class:d(["slidev-layout h-fit w-full",a.value.r])},[i(o.$slots,"content",{},void 0,!0),i(o.$slots,"default",{},void 0,!0)],2)])])):(n(),u("div",I,[t("div",S,[t("div",{class:d(["slidev-layout h-fit w-full",a.value.l])},[i(o.$slots,"content",{},void 0,!0),i(o.$slots,"default",{},void 0,!0)],2)]),t("div",{class:d(["slidecolor column-title",m.value])},[t("div",{class:d(["slidev-layout sidetitle w-full p-6",a.value.r])},[i(o.$slots,"title",{},void 0,!0)],2)],2)]))]))}},E=k(C,[["__scopeId","data-v-448e2194"]]);export{E as I};