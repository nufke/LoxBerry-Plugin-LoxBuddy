"use strict";(self.webpackChunkapp=self.webpackChunkapp||[]).push([[3126],{577:(P,c,o)=>{o.d(c,{o:()=>m});var s=o(6814),u=o(5879);let m=(()=>{var a;class e{}return(a=e).\u0275fac=function(g){return new(g||a)},a.\u0275mod=u.oAB({type:a}),a.\u0275inj=u.cJS({imports:[s.ez]}),e})()},3126:(P,c,o)=>{o.r(c),o.d(c,{TabsPageModule:()=>f});var s=o(9843),u=o(6814),m=o(6223),a=o(9515),e=o(4282),t=o(5879);const g=["tabs"],C=[{path:"app",component:(()=>{var n;class i{constructor(l){this.navCtrl=l}click(l){this.navCtrl.navigateRoot(l)}}return(n=i).\u0275fac=function(l){return new(l||n)(t.Y36(s.SH))},n.\u0275cmp=t.Xpm({type:n,selectors:[["app-tabs"]],viewQuery:function(l,h){if(1&l&&t.Gf(g,5),2&l){let r;t.iGM(r=t.CRH())&&(h.tabs=r.first)}},decls:15,vars:9,consts:[["tabs",""],["slot","bottom"],["tab","home",1,"tab_no_ripple",3,"click"],["name","home-outline"],["tab","room",1,"tab_no_ripple",3,"click"],["name","grid-sharp"],["tab","category",1,"tab_no_ripple",3,"click"],["name","list-sharp"]],template:function(l,h){1&l&&(t.TgZ(0,"ion-tabs",null,0)(2,"ion-tab-bar",1)(3,"ion-tab-button",2),t.NdJ("click",function(){return h.click("app/home")}),t._UZ(4,"ion-icon",3),t._uU(5),t.ALo(6,"translate"),t.qZA(),t.TgZ(7,"ion-tab-button",4),t.NdJ("click",function(){return h.click("app/room")}),t._UZ(8,"ion-icon",5),t._uU(9),t.ALo(10,"translate"),t.qZA(),t.TgZ(11,"ion-tab-button",6),t.NdJ("click",function(){return h.click("app/category")}),t._UZ(12,"ion-icon",7),t._uU(13),t.ALo(14,"translate"),t.qZA()()()),2&l&&(t.xp6(5),t.hij(" ",t.lcZ(6,3,"Home")," "),t.xp6(4),t.hij(" ",t.lcZ(10,5,"Rooms")," "),t.xp6(4),t.hij(" ",t.lcZ(14,7,"Categories")," "))},dependencies:[s.gu,s.yq,s.ZU,s.UN,a.X$]}),i})(),children:[{path:"home",loadChildren:()=>Promise.all([o.e(8934),o.e(6043)]).then(o.bind(o,6043)).then(n=>n.ControlsPageModule)},{path:"room",loadChildren:()=>o.e(6817).then(o.bind(o,6817)).then(n=>n.RoomsPageModule)},{path:"room/:serialNr/:uuid",loadChildren:()=>Promise.all([o.e(8934),o.e(6043)]).then(o.bind(o,6043)).then(n=>n.ControlsPageModule)},{path:"category",loadChildren:()=>o.e(8366).then(o.bind(o,8366)).then(n=>n.CategoriesPageModule)},{path:"category/:serialNr/:uuid",loadChildren:()=>Promise.all([o.e(8934),o.e(6043)]).then(o.bind(o,6043)).then(n=>n.ControlsPageModule)}]},{path:"app/home/:controlSerialNr/:controlUuid",loadChildren:()=>Promise.all([o.e(8934),o.e(5488)]).then(o.bind(o,5488)).then(n=>n.DetailedControlPageModule)},{path:"app/:domain/:serialNr/:uuid/:controlSerialNr/:controlUuid",loadChildren:()=>Promise.all([o.e(8934),o.e(5488)]).then(o.bind(o,5488)).then(n=>n.DetailedControlPageModule)},{path:"app/:domain/:serialNr/:uuid/:controlSerialNr/:controlUuid/:subControlUuid",loadChildren:()=>Promise.all([o.e(8934),o.e(5488)]).then(o.bind(o,5488)).then(n=>n.DetailedControlPageModule)},{path:"app/:domain/:serialNr/:uuid/:controlSerialNr/:controlUuid/:subControlUuid/:subControlUuidExt",loadChildren:()=>Promise.all([o.e(8934),o.e(5488)]).then(o.bind(o,5488)).then(n=>n.DetailedControlPageModule)},{path:"",redirectTo:"app/home",pathMatch:"full"}];let T=(()=>{var n;class i{}return(n=i).\u0275fac=function(l){return new(l||n)},n.\u0275mod=t.oAB({type:n}),n.\u0275inj=t.cJS({imports:[e.Bz.forChild(C),e.Bz]}),i})();var M=o(577);let f=(()=>{var n;class i{}return(n=i).\u0275fac=function(l){return new(l||n)},n.\u0275mod=t.oAB({type:n}),n.\u0275inj=t.cJS({imports:[s.Pc,u.ez,m.u5,T,a.aw.forChild(),M.o]}),i})()}}]);