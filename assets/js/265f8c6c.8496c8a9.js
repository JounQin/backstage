"use strict";(self.webpackChunkbackstage_microsite=self.webpackChunkbackstage_microsite||[]).push([[939439],{137642:(e,t,a)=>{a.d(t,{n:()=>l});var n=a(490512),o=a(667294);const r="bannerSection_EqIc",l=({children:e,className:t,greyBackground:a=!1,diagonalBorder:l=!1,diagonalBottomBorder:i=!1,greenGradientBackground:s=!1,greenBottomGradientBackground:c=!1,greenCallToActionGradientBackground:m=!1})=>o.createElement("section",{className:(0,n.Z)(r,t,{greyBackground:a,diagonalBorder:l,diagonalBottomBorder:i,greenGradientBackground:s,greenBottomGradientBackground:c,greenCallToActionGradientBackground:m})},o.createElement("div",{className:"container padding-horiz--lg padding-vert--xl"},e))},201340:(e,t,a)=>{a.d(t,{E:()=>i});var n=a(490512),o=a(667294);const r="sectionGridContainer__rT4",l="gridContainer_uAL8",i=({header:e,children:t,className:a})=>o.createElement("div",{className:(0,n.Z)(r,a)},e&&o.createElement("div",{className:"gridHeader"},e),o.createElement("div",{className:l},Array.isArray(t)?t.map(((e,t)=>o.cloneElement(e,{key:t,className:(0,n.Z)(e.props.className)}))):t))},448501:(e,t,a)=>{a.d(t,{b:()=>i});var n=a(377657),o=a(490512),r=a(667294);const l="contentBlock_rJQu",i=({children:e,title:t,className:a,topImgSrc:i,hasBulletLine:s,actionButtons:c})=>r.createElement("div",{className:(0,o.Z)(a,l)},i&&r.createElement("img",{src:i,alt:i}),r.createElement("div",{className:"contentBlockTitle"},s&&r.createElement("div",{className:"bulletLine"}),t&&r.isValidElement(t)?t:r.createElement("h2",null,t)),e&&r.isValidElement(e)?e:r.createElement("p",null,e),c&&r.createElement("div",{className:"actionButtons",style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))",gap:"15px"}},c.map((({link:e,label:t},a)=>r.createElement(n.Z,{key:a,className:"button button--primary button--lg",to:e},t)))))},390035:(e,t,a)=>{a.r(t),a.d(t,{default:()=>u});var n=a(377657),o=a(208241),r=a(137642),l=a(201340),i=a(692317),s=a(490512),c=a(667294),m=a(448501);const d="communityPage_UbHY",g="listContainer_pCIy",u=()=>{const{siteConfig:e}=(0,o.Z)();return c.createElement(i.Z,null,c.createElement("div",{className:(0,s.W)(d)},c.createElement(r.n,{diagonalBottomBorder:!0,greyBackground:!0},c.createElement(l.E,null,c.createElement(m.b,{className:"padding-right--xl",title:c.createElement("h1",null,"Backstage Community")},"Join the vibrant community around Backstage through social media and different meetups. To ensure that you have a welcoming environment, we follow the",c.createElement(n.Z,{to:"https://github.com/cncf/foundation/blob/master/code-of-conduct.md"}," ","CNCF Code of Conduct"," "),"in everything we do."),c.createElement(m.b,{className:(0,s.W)("padding-left--xl",g),title:"Get started in our community!"},c.createElement("ul",null,[{content:"Chat and get support on our",label:"Discord",link:"https://discord.gg/backstage-687207715902193673"},{content:"Get into contributing with the",label:"Good First Issues",link:"https://github.com/backstage/backstage/contribute"},{content:"Subscribe to the",label:"Community newsletter",link:"https://info.backstage.spotify.com/newsletter_subscribe"}].map((({content:e,link:t,label:a},o)=>c.createElement("li",{key:o},c.createElement("p",{className:"margin-bottom--none"},e," ",c.createElement(n.Z,{to:t},a))))))))),c.createElement(r.n,{diagonalBorder:!0,greenBottomGradientBackground:!0},c.createElement(l.E,{header:c.createElement(c.Fragment,null,c.createElement("h2",{className:"text--primary"},"Offical Backstage initiatives"),c.createElement("h1",null,"Stay tuned to the latest developments"))},[{title:"Community sessions",content:"Maintainers and adopters meet monthly to share updates, demos, and ideas. You can find recorded session on our YouTube channel!",link:"https://github.com/backstage/community/tree/main/backstage-community-sessions#backstage-community-sessions",label:"Join a session"},{title:"Newsletter",content:"The official monthly Backstage newsletter. Don't miss the latest news from your favorite project!",link:"https://info.backstage.spotify.com/newsletter_subscribe",label:"Subscribe"}].map((({title:e,content:t,link:a,label:n},o)=>c.createElement(m.b,{key:o,title:e,hasBulletLine:!0,actionButtons:[{link:a,label:n}]},t))))),c.createElement(r.n,{diagonalBorder:!0},c.createElement(l.E,{header:c.createElement("h2",{className:"text--primary"},"Trainings and Certifications")},[{title:"Introduction to Backstage: Developer Portals Made Easy (LFS142x)",content:"This is a course produced and curated by the Linux Foundation. This course introduces you to Backstage and how to get started with the project.",link:"https://training.linuxfoundation.org/training/introduction-to-backstage-developer-portals-made-easy-lfs142x/",label:"Learn more"}].map((({title:e,content:t,link:a,label:n},o)=>c.createElement(m.b,{key:o,title:e,hasBulletLine:!0,actionButtons:[{link:a,label:n}]},c.createElement("p",null,t)))))),c.createElement(r.n,{greyBackground:!0},c.createElement(l.E,{header:c.createElement("h2",{className:"text--primary"},"Commercial Partners")},[{name:"Frontside Software",url:"https://frontside.com/backstage/",logo:"img/partner-logo-frontside.png"},{name:"RedHat",url:"https://www.redhat.com/",logo:"img/partner-logo-redhat.png"},{name:"Roadie",url:"https://roadie.io/",logo:"img/partner-logo-roadie.png"},{name:"ThoughtWorks",url:"https://www.thoughtworks.com",logo:"img/partner-logo-thoughtworks.png"},{name:"VMWare",url:"https://tanzu.vmware.com/",logo:"img/partner-logo-tanzubybroadcom.png"}].map((({name:t,url:a,logo:o},r)=>c.createElement("div",{key:r},c.createElement(n.Z,{to:a},c.createElement("img",{src:`${e.baseUrl}${o}`,alt:t})))))))))}}}]);