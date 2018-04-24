import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';


// import { FcmProvider } from '../../providers/fcm/fcm';
import { ToastController,ModalController,LoadingController } from 'ionic-angular';
import { Subject } from 'rxjs/Subject';
import { tap } from 'rxjs/operators'


import { AngularFireAuth } from 'angularfire2/auth';
import { 
  AngularFirestore,
  AngularFirestoreDocument,
  AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { AuthService } from '../../services/AuthService';

// import { DashPage } from '../dash/dash';
import { CartModalPage } from '../cart-modal/cart-modal';


interface Items {
  product_name: number,
  product_cost: string,
  product_description: number,
  product_image: number,
}
interface ItemId extends Items{ id:string }

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  displayName:string;

  user:any;

  itemsCollection: AngularFirestoreCollection<Items>; //Firestore collection
  items: Observable<Items[]>; // read collection

  private shirtCollection: AngularFirestoreCollection<Items>;
  shirts: Observable<ItemId[]>;

  cartList:any[]=[];

  constructor(
    public navCtrl: NavController,
    // private fcm:FcmProvider,
    private auth:AngularFireAuth,
    private authService:AuthService,
    public toastCtrl:ToastController,
    public modalCtrl:ModalController,
    public afs:AngularFirestore,
    public toast:ToastController,
    public loadingCtrl: LoadingController
  ) {

    // this.auth.auth.onAuthStateChanged(user => {
    //   if (user) {
        // this.navCtrl.push(DashPage);
        // this.user = user;
      // } else {
      //   this.rootPage = DashPage;
      //   this.unsubscribe();
      // }
    // });
    // afs.collection('products').snapshotChanges()
    /*
    fcm.getToken()

    // Listen to incoming messages
    fcm.listenToNotifications().pipe(
      tap(msg => {
        // show a toast
        const toast = toastCtrl.create({
          message: msg.body,
          duration: 3000
        });
        toast.present();
      })
    )
    .subscribe()*/
    let loading = loadingCtrl.create({
      content: 'cargando productos...'
    });
    loading.present();

    // setTimeout(() => {
    //   alert("2 segundos");
    // }, 1000);
    this.loadProducts()
    setTimeout(() => {

      loading.dismiss();
    }, 3000);

    if(this.authService.authState){
      
      this.displayName = this.authService.currentUserDisplayName();
    }else{
      this.displayName = "Inicia sesion"
    }

  }

  //  getProducts(){
  //     db.collection('products').get().then((querySnapshot)=>{
  //     querySnapshot.forEach((doc)=>{
  //       if(doc && doc.exists){
  //         const data = doc.data()
  //         output_products.innerHTML += `name: ${data.product_name} \n 
  //                     ${data.product_cost}
  //         `
  //         console.log(data)
  //       }else{
  //         console.log('no existe la collection products')
  //       }  
  //     })
  // })
  // }
  showToast(msj:string){
    this.toast.create({
      message:msj,
      position:"top",
      duration:1500,
    }).present();
  }
  loadProducts(){
   this.shirtCollection = this.afs.collection<Items>('products');
    this.shirts = this.shirtCollection.snapshotChanges().map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data() as Items;
        const id = a.payload.doc.id;
        return { id, ...data };
      });
    });
  }
  ionViewWillEnter() {
    // this.itemsCollection = this.afs.collection('products'); //ref()
    // this.items = this.itemsCollection.valueChanges()
  }
  goToPay(){

  }
  addToFavorites(id:string){
    if(this.authService.authState){//si esta logueado
      let exist=false;
      // this.afs.collection(`users_like`).doc(this.authService.currentUserId()).snapshotChanges().map(actions=>{
      this.afs.collection(`users_like/${this.authService.currentUserId()}/${id}`).auditTrail().map(actions=>{
        console.log(`fase 1`);
        return actions.map(a=>{
          console.log(`fase 2`);
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          if(data.like){
            console.log(`fase 3`);
            exist = true
          }
          return { id, ...data };
        })
      });  
     
      if(!exist){
        // no existe
        console.log(`NO existe favorito con id: ${id}`);
        let new_id = this.afs.createId();
        this.afs.collection(`users_like/${this.authService.currentUserId()}/${id}`).add({
          like:true
        })
      console.log(`agregar a favoritos con id: ${id}`);
      this.viewCarList();
      }
    }
  }
  addToCar(product:ItemId){
    let exist= false;

    if(this.cartList.length == 0) { return this.showModalCart(product);}
    console.log(`PRODUCTO ${product.product_name}`);

    this.cartList.map((prod)=>{
      // debugger;
        if(prod.p.id==product.id){
          exist = true;
          this.showToast("YA ESTA EN CARRITO")
          console.log("YA ESTA EN CART");
          return;
        }
    })
    if(!exist){
      this.showModalCart(product);
    }
    console.log(this.cartList);
  }
  showModalCart(product:ItemId){
    let modal = this.modalCtrl.create(CartModalPage,  { product: product });
    modal.onDidDismiss(data=>{
      console.log(data);
      // debugger;
      if(data.quantity>0){
        let new_product = {p:product,amount:data.quantity}
        this.cartList.push(new_product);
        console.log(`agregar al carrito ${product.product_name}`);
      }
      console.log(this.cartList);    })
    modal.present();
  }
  viewCarList(){
    let ids=''; //ids of products
    if(this.cartList.length == 0) return;
    this.cartList.map(v=>{
      // debugger;
      ids+=`${v} \n`;
    })
    alert(ids)
  }
}