import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  deleteUser,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";
type Tab = "inicio" | "guardados" | "listas" | "alertas" | "perfil";
type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  detail: string;
  imageUrl?: string;
  imageSource?: string;
  bestPrice?: number;
  oldPrice?: number;
  shipping?: number;
  store?: string;
  offerUrl?: string;
  offersCount?: number;
  priceStatus?: "queued" | "checking" | "ready" | "no_offer";
  refreshRequestedAt?: unknown;
  createdAt?: unknown;
};
type ShoppingList={id:string;name:string;productIds:string[];createdAt?:unknown};
type PriceAlert={id:string;productId:string;productName:string;type:"price_drop"|"target_price";threshold?:number;active:boolean;createdAt?:unknown};
type AlertEvent={id:string;alertId:string;productId:string;productName:string;message:string;price:number;store?:string;offerUrl?:string;createdAt?:unknown};
type Offer = {
  id: string;
  product: string;
  brand: string;
  store: string;
  price: number;
  oldPrice?: number;
  shipping?: number;
  scope: string;
  updatedAt?: unknown;
};

async function findProductImage(name: string, brand: string, category: string) {
  if (category !== "Mercado") return null;
  try {
    const url = new URL("https://world.openfoodfacts.org/api/v2/search");
    url.searchParams.set("q", `${name} ${brand}`);
    url.searchParams.set("page_size", "8");
    url.searchParams.set("fields", "product_name,brands,image_front_url,image_url");
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = (await response.json()) as { products?: Array<{ brands?: string; image_front_url?: string; image_url?: string }> };
    const wanted = brand.toLocaleLowerCase("pt-BR");
    const match = data.products?.find((p) => p.brands?.toLocaleLowerCase("pt-BR").includes(wanted) && (p.image_front_url || p.image_url));
    const imageUrl = match?.image_front_url || match?.image_url;
    return imageUrl ? { imageUrl, imageSource: "Open Food Facts" } : null;
  } catch {
    return null;
  }
}
const money = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    n,
  );
const examples: Offer[] = [
  {
    id: "pilao",
    product: "Café torrado",
    brand: "Pilão",
    store: "Carrefour",
    price: 22.49,
    oldPrice: 27.9,
    shipping: 6.9,
    scope: "São Paulo",
  },
  {
    id: "tv",
    product: "Smart TV 55” 4K",
    brand: "Samsung",
    store: "Magalu",
    price: 2299,
    oldPrice: 2699,
    shipping: 0,
    scope: "Envio nacional",
  },
];
function ShopApp() {
  const [user, setUser] = useState<User | null>(null),
    [tab, setTab] = useState<Tab>("inicio"),
    [products, setProducts] = useState<Product[]>([]),
    [lists,setLists]=useState<ShoppingList[]>([]),
    [alerts,setAlerts]=useState<PriceAlert[]>([]),
    [alertEvents,setAlertEvents]=useState<AlertEvent[]>([]),
    [segment, setSegment] = useState<"Todos" | "Mercado" | "Hogar">("Todos"),
    [open, setOpen] = useState(false),
    [preferencesOpen, setPreferencesOpen] = useState(false),
    [listOpen,setListOpen]=useState(false),
    [alertOpen,setAlertOpen]=useState(false),
    [location, setLocation] = useState("São Paulo, SP"),
    [radius, setRadius] = useState(10),
    [toast, setToast] = useState("");
  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setUser(u);
        if (u)
          setDoc(
            doc(db, "users", u.uid),
            {
              name: u.displayName,
              email: u.email,
              photoURL: u.photoURL,
              lastLoginAt: serverTimestamp(),
            },
            { merge: true },
          );
      }),
    [],
  );
  useEffect(() => {
    if (!user) {
      setProducts([]);
      return;
    }
    return onSnapshot(
      query(
        collection(db, "users", user.uid, "products"),
        orderBy("createdAt", "desc"),
      ),
      (s) =>
        setProducts(s.docs.map((d) => ({ id: d.id, ...d.data() }) as Product)),
    );
  }, [user]);
  useEffect(()=>{if(!user){setLists([]);setAlerts([]);setAlertEvents([]);return}const stopLists=onSnapshot(query(collection(db,"users",user.uid,"lists"),orderBy("createdAt","desc")),s=>setLists(s.docs.map(d=>({id:d.id,...d.data()}as ShoppingList)))),stopAlerts=onSnapshot(query(collection(db,"users",user.uid,"alerts"),orderBy("createdAt","desc")),s=>setAlerts(s.docs.map(d=>({id:d.id,...d.data()}as PriceAlert)))),stopEvents=onSnapshot(query(collection(db,"users",user.uid,"alertEvents"),orderBy("createdAt","desc")),s=>setAlertEvents(s.docs.map(d=>({id:d.id,...d.data()}as AlertEvent))));return()=>{stopLists();stopAlerts();stopEvents()}},[user]);
  useEffect(() => {
    if (!user) return;
    return onSnapshot(doc(db, "users", user.uid), (snapshot) => {
      const data = snapshot.data();
      if (data?.location) setLocation(data.location);
      if (data?.radiusKm) setRadius(data.radiusKm);
    });
  }, [user]);
  const savings = useMemo(() => products.reduce((n, p) => n + Math.max(0, (p.oldPrice || p.bestPrice || 0) - (p.bestPrice || 0)), 0), [products]);
  const visibleProducts = useMemo(() => products.filter((p) => segment === "Todos" || p.category === segment), [products, segment]);
  const notify = (s: string) => {
    setToast(s);
    setTimeout(() => setToast(""), 2600);
  };
  async function login() {
    await signInWithPopup(auth, googleProvider);
  }
  async function removeAccount() {
    if (!user || !confirm("¿Eliminar definitivamente tu cuenta y datos?"))
      return;
    for (const p of (
      await getDocs(collection(db, "users", user.uid, "products"))
    ).docs)
      await deleteDoc(p.ref);
    await deleteDoc(doc(db, "users", user.uid));
    await deleteUser(user);
  }
  return (
    <div className="app">
      <header>
        <a className="brand" onClick={() => setTab("inicio")}>
          <i>S</i>shop<b>certo</b>
        </a>
        <button className="place" onClick={() => setPreferencesOpen(true)}>
          ⌖ {location}
        </button>
        <button className="avatar" onClick={() => setTab("perfil")}>
          {user?.photoURL ? (
            <img src={user.photoURL} />
          ) : (
            user?.displayName?.[0] || "?"
          )}
        </button>
      </header>
      <main>
        {tab === "inicio" && (
          <>
            <section className="hero">
              <small>ECONOMIZE PERTO DE VOCÊ</small>
              <h1>
                Qual preço
                <br />
                você quer comparar?
              </h1>
              <p>Salve produtos e encontre onde comprar melhor.</p>
              <button onClick={() => (user ? setOpen(true) : login())}>
                <b>＋</b>
                <span>
                  <strong>Adicionar produto</strong>
                  <small>Nome, marca e pronto</small>
                </span>
                ›
              </button>
            </section>
            <section className="quick">
              <button className={segment === "Mercado" ? "active" : ""} onClick={() => setSegment(segment === "Mercado" ? "Todos" : "Mercado")}>
                🛒
                <span>
                  <b>Supermercado</b>
                  <small>{products.filter((p) => p.category === "Mercado").length} produtos guardados</small>
                </span>
              </button>
              <button className={segment === "Hogar" ? "active" : ""} onClick={() => setSegment(segment === "Hogar" ? "Todos" : "Hogar")}>
                🏠
                <span>
                  <b>Casa e eletro</b>
                  <small>{products.filter((p) => p.category === "Hogar").length} produtos guardados</small>
                </span>
              </button>
            </section>
            <Title
              over="ATUALIZADO DIARIAMENTE"
              title="Melhores ofertas dos seus produtos"
              sub={`${visibleProducts.length} produtos ${segment === "Todos" ? "acompanhados" : `em ${segment}`}`}
            />
            <div className="cards">
              {visibleProducts.map((p) => <ProductOfferCard key={p.id} product={p} remove={() => user && deleteDoc(doc(db,"users",user.uid,"products",p.id))} />)}
            </div>
            {!visibleProducts.length ? <Empty icon="＋" text={segment === "Todos" ? "Adicione seu primeiro produto para começar a comparar preços." : `Ainda não há produtos em ${segment}.`} action={()=>setOpen(true)} /> : <div className="saving">✨ <span><b>Economia encontrada</b><small>{money(savings)} comparando seus produtos</small></span></div>}
          </>
        )}
        {tab === "guardados" && (
          <>
            <Title
              over="SEUS PRODUTOS"
              title="Guardados"
              sub={`${products.length} produtos acompanhados`}
            />
            {user ? (
              <div className="cards">
                {products.map((p) => (
                  <article className="product" key={p.id}>
                    <div>{p.imageUrl ? <img src={p.imageUrl} alt={p.name} /> : "🛍️"}</div>
                    <span>
                      <b>{p.name}</b>
                      <small>
                        {p.brand} · {p.detail}
                      </small>
                    </span>
                    <button
                      onClick={() =>
                        deleteDoc(doc(db, "users", user.uid, "products", p.id))
                      }
                    >
                      ×
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <Login login={login} />
            )}{" "}
            {user && (
              <button className="fab" onClick={() => setOpen(true)}>
                ＋
              </button>
            )}
          </>
        )}
        {tab === "listas" && (
          <>
            <Title
              over="PLANEJE SUA COMPRA"
              title="Minhas listas"
              sub="Organize os produtos que vai comprar"
            />
            {lists.length ? <div className="list-cards">{lists.map(list=><article className="list-card" key={list.id}><header><span><small>LISTA</small><b>{list.name}</b></span><button onClick={()=>user&&deleteDoc(doc(db,"users",user.uid,"lists",list.id))} aria-label={`Eliminar ${list.name}`}>×</button></header><div>{products.filter(p=>list.productIds.includes(p.id)).map(p=><span className="list-product" key={p.id}>{p.imageUrl?<img src={p.imageUrl} alt=""/>:<i>{p.category==="Mercado"?"🛒":"🏠"}</i>}<b>{p.name}</b><small>{p.brand}</small></span>)}</div></article>)}</div>:<Empty icon="☷" text="Crie uma lista com os produtos que pretende comprar." action={()=>products.length?setListOpen(true):setOpen(true)} />}
            <button className="section-add" onClick={()=>products.length?setListOpen(true):setOpen(true)}>＋ {products.length?"Nova lista":"Adicionar produto primeiro"}</button>
          </>
        )}
        {tab === "alertas" && (
          <>
            <Title
              over="AVISAMOS VOCÊ"
              title="Alertas"
              sub="Quedas de preço e ofertas"
            />
            {alertEvents.length>0&&<section className="alert-history"><h3>Novidades detectadas</h3>{alertEvents.map(event=><a key={event.id} href={event.offerUrl||undefined} target={event.offerUrl?"_blank":undefined} rel="noreferrer"><i>↓</i><span><b>{event.productName}</b><small>{event.message}{event.store?` · ${event.store}`:""}</small></span><strong>{money(event.price)}</strong></a>)}</section>}
            {alerts.length?<div className="alert-cards">{alerts.map(alert=><article className="alert-card" key={alert.id}><i>🔔</i><span><b>{alert.productName}</b><small>{alert.type==="price_drop"?"Avisar quando o preço baixar":`Avisar quando chegar a ${money(alert.threshold||0)}`}</small></span><em>Ativo</em><button onClick={()=>user&&deleteDoc(doc(db,"users",user.uid,"alerts",alert.id))} aria-label={`Eliminar alerta de ${alert.productName}`}>×</button></article>)}</div>:<Empty icon="🔔" text={products.length?"Crie um alerta para saber quando o preço baixar.":"Adicione um produto para criar seu primeiro alerta."} action={()=>products.length?setAlertOpen(true):setOpen(true)} />}
            <button className="section-add" onClick={()=>products.length?setAlertOpen(true):setOpen(true)}>＋ {products.length?"Novo alerta":"Adicionar produto primeiro"}</button>
          </>
        )}
        {tab === "perfil" && (
          <>
            <Title
              over="SEU ESPAÇO"
              title="Minha conta"
              sub="Preferências e privacidade"
            />
            {user ? (
              <>
                <section className="profile">
                  <div className="big-avatar">
                    {user.photoURL ? (
                      <img src={user.photoURL} />
                    ) : (
                      user.displayName?.[0]
                    )}
                  </div>
                  <span>
                    <b>{user.displayName}</b>
                    <small>{user.email}</small>
                    <em>● Sincronização ativa</em>
                  </span>
                  <button onClick={() => signOut(auth)}>Sair</button>
                </section>
                <section className="settings">
                  <button onClick={() => setPreferencesOpen(true)}>
                    ⌖
                    <span>
                      <b>Localização</b>
                      <small>{location}</small>
                    </span>
                    ›
                  </button>
                  <button onClick={() => setPreferencesOpen(true)}>
                    ◎
                    <span>
                      <b>Raio de busca</b>
                      <small>{radius} km</small>
                    </span>
                    ›
                  </button>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      const blob = new Blob([
                          JSON.stringify(
                            {
                              account: {
                                name: user.displayName,
                                email: user.email,
                              },
                              products,
                            },
                            null,
                            2,
                          ),
                        ]),
                        a = document.createElement("a");
                      a.href = URL.createObjectURL(blob);
                      a.download = "shopcerto-dados.json";
                      a.click();
                    }}
                  >
                    ⇩ Exportar meus dados
                  </a>
                  <button className="danger" onClick={removeAccount}>
                    Eliminar minha conta
                  </button>
                </section>
              </>
            ) : (
              <Login login={login} />
            )}
          </>
        )}
      </main>
      <nav>
        {(
          [
            ["inicio", "⌂", "Início"],
            ["guardados", "♡", "Guardados"],
            ["listas", "☷", "Listas"],
            ["alertas", "♢", "Alertas"],
            ["perfil", "○", "Conta"],
          ] as const
        ).map(([id, icon, label]) => (
          <button
            className={tab === id ? "active" : ""}
            onClick={() => setTab(id)}
            key={id}
          >
            <i>{icon}</i>
            <span>{label}</span>
          </button>
        ))}
      </nav>
      {open && (
        <Add
          close={() => setOpen(false)}
          save={async (p) => {
            if (!user) return;
            const image = await findProductImage(p.name, p.brand, p.category);
            const productRef = await addDoc(collection(db, "users", user.uid, "products"), {
              ...p,
              ...(image || {}),
              priceStatus: "queued",
              refreshRequestedAt: serverTimestamp(),
              createdAt: serverTimestamp(),
            });
            await setDoc(doc(db, "priceRequests", `${user.uid}_${productRef.id}`), {userId:user.uid,productId:productRef.id,name:p.name,brand:p.brand,category:p.category,status:"pending",requestedAt:serverTimestamp()});
            setOpen(false);
            notify("Produto salvo. As ofertas aparecerão em até 5 minutos.");
          }}
        />
      )}
      {listOpen&&user&&<ListEditor products={products} close={()=>setListOpen(false)} save={async(name,productIds)=>{await addDoc(collection(db,"users",user.uid,"lists"),{name,productIds,createdAt:serverTimestamp()});setListOpen(false);notify("Lista criada.")}}/>}
      {alertOpen&&user&&<AlertEditor products={products} close={()=>setAlertOpen(false)} save={async(value)=>{const product=products.find(p=>p.id===value.productId);if(!product)return;await addDoc(collection(db,"users",user.uid,"alerts"),{...value,productName:product.name,active:true,createdAt:serverTimestamp()});setAlertOpen(false);notify("Alerta ativado.")}}/>}
      {preferencesOpen && user && <Preferences location={location} radius={radius} close={() => setPreferencesOpen(false)} save={async (nextLocation, nextRadius, place) => {await setDoc(doc(db,"users",user.uid),{location:nextLocation,radiusKm:nextRadius,...(place?{latitude:place.latitude,longitude:place.longitude,postalCode:place.postcode||null}:{}),preferencesUpdatedAt:serverTimestamp()},{merge:true});setPreferencesOpen(false);notify("Localização e raio atualizados.");}} />}
      {toast && <div className="toast">✓ {toast}</div>}
    </div>
  );
}
function Title({
  over,
  title,
  sub,
}: {
  over: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="title">
      <small>{over}</small>
      <h2>{title}</h2>
      <p>{sub}</p>
    </div>
  );
}
function ProductOfferCard({ product, remove }: { product: Product; remove: () => void }) {
  const total = (product.bestPrice || 0) + (product.shipping || 0),
    drop = product.oldPrice && product.bestPrice ? Math.round((1 - product.bestPrice / product.oldPrice) * 100) : 0;
  return (
    <article className={`offer ${product.bestPrice ? "has-offer" : "waiting-offer"}`}>
      <div className="offer-top">
        <div className="pic">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : product.category === "Mercado" ? "🛒" : "🏠"}</div>
        <span>
          <em>{product.category}</em>
          <b>{product.name}</b>
          <small>{product.brand} · {product.detail}</small>
        </span>
        <button className="remove-product" onClick={remove} aria-label={`Eliminar ${product.name}`}>×</button>
      </div>
      {product.bestPrice && product.offerUrl ? <a className="offer-link" href={product.offerUrl} target="_blank" rel="noreferrer"><div className="price"><small>Melhor preço</small><b>{money(product.bestPrice)}</b>{product.oldPrice && <del>{money(product.oldPrice)}</del>}{drop > 0 && <em>↓ {drop}%</em>}</div><footer><span>{product.store || "Loja verificada"}</span><b>Total {money(total)} · Abrir oferta ›</b></footer></a> : <div className="offer-pending"><i></i><span><b>Buscando ofertas</b><small>Primeiros resultados em até 5 minutos. Depois, atualização diária.</small></span></div>}
    </article>
  );
}
function Login({ login }: { login: () => void }) {
  return (
    <section className="login">
      <div>G</div>
      <h3>Entre para guardar tudo</h3>
      <p>Seus produtos, listas e alertas ficam sincronizados.</p>
      <button onClick={login}>Continuar com Google</button>
    </section>
  );
}
function Empty({ icon, text, action }: { icon: string; text: string; action?:()=>void }) {
  const Tag=action?"button":"section";
  return (
    <Tag className={`empty ${action?"empty-action":""}`} onClick={action}>
      <i>{icon}</i>
      <p>{text}</p>
    </Tag>
  );
}
function Add({
  close,
  save,
}: {
  close: () => void;
  save: (p: Omit<Product, "id">) => void;
}) {
  const [name, setName] = useState(""),
    [brand, setBrand] = useState(""),
    [category, setCategory] = useState("Mercado"),
    [detail, setDetail] = useState("");
  function submit(e: FormEvent) {
    e.preventDefault();
    save({ name, brand, category, detail });
  }
  return (
    <div
      className="overlay"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <form onSubmit={submit} className="sheet">
        <header>
          <span>
            <small>NOVO ACOMPANHAMENTO</small>
            <h2>Qual é o produto?</h2>
          </span>
          <button type="button" onClick={close}>
            ×
          </button>
        </header>
        <div className="categories">
          <button
            type="button"
            className={category === "Mercado" ? "active" : ""}
            onClick={() => setCategory("Mercado")}
          >
            🛒 Mercado
          </button>
          <button
            type="button"
            className={category === "Hogar" ? "active" : ""}
            onClick={() => setCategory("Hogar")}
          >
            🏠 Casa e eletro
          </button>
        </div>
        <label>
          Nome
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex. Café torrado"
          />
        </label>
        <label>
          Marca
          <input
            required
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Ex. Pilão"
          />
        </label>
        <label>
          Apresentação ou modelo
          <input
            required
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="Ex. pacote 500 g"
          />
        </label>
        <button className="primary">Salvar produto</button>
      </form>
    </div>
  );
}

function ListEditor({products,close,save}:{products:Product[];close:()=>void;save:(name:string,productIds:string[])=>void}){
  const [name,setName]=useState(""),[selected,setSelected]=useState<string[]>([]);
  const toggle=(id:string)=>setSelected(current=>current.includes(id)?current.filter(item=>item!==id):[...current,id]);
  return <div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&close()}><form className="sheet" onSubmit={e=>{e.preventDefault();if(selected.length)save(name.trim(),selected)}}><header><span><small>NOVA LISTA</small><h2>Planeje sua compra</h2></span><button type="button" onClick={close}>×</button></header><label>Nome da lista<input required value={name} onChange={e=>setName(e.target.value)} placeholder="Ex. Compra da semana"/></label><fieldset className="product-picker"><legend>Escolha os produtos</legend>{products.map(product=><label key={product.id}><input type="checkbox" checked={selected.includes(product.id)} onChange={()=>toggle(product.id)}/><span><b>{product.name}</b><small>{product.brand} · {product.detail}</small></span></label>)}</fieldset><button className="primary" disabled={!selected.length}>Criar lista ({selected.length})</button></form></div>
}

function AlertEditor({products,close,save}:{products:Product[];close:()=>void;save:(value:{productId:string;type:"price_drop"|"target_price";threshold?:number})=>void}){
  const [productId,setProductId]=useState(products[0]?.id||""),[type,setType]=useState<"price_drop"|"target_price">("price_drop"),[threshold,setThreshold]=useState("");
  return <div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&close()}><form className="sheet" onSubmit={e=>{e.preventDefault();save({productId,type,...(type==="target_price"?{threshold:Number(threshold)}:{})})}}><header><span><small>NOVO ALERTA</small><h2>Quando avisar?</h2></span><button type="button" onClick={close}>×</button></header><label>Produto<select value={productId} onChange={e=>setProductId(e.target.value)}>{products.map(product=><option value={product.id} key={product.id}>{product.name} · {product.brand}</option>)}</select></label><div className="alert-types"><button type="button" className={type==="price_drop"?"active":""} onClick={()=>setType("price_drop")}><b>Qualquer queda</b><small>Avisar quando ficar mais barato</small></button><button type="button" className={type==="target_price"?"active":""} onClick={()=>setType("target_price")}><b>Preço desejado</b><small>Defina o valor máximo</small></button></div>{type==="target_price"&&<label>Preço desejado (R$)<input required min="0.01" step="0.01" type="number" value={threshold} onChange={e=>setThreshold(e.target.value)} placeholder="Ex. 19,90"/></label>}<button className="primary">Ativar alerta</button></form></div>
}

type PlaceSuggestion={label:string;latitude:number;longitude:number;postcode?:string};
function Preferences({location,radius,close,save}:{location:string;radius:number;close:()=>void;save:(location:string,radius:number,place?:PlaceSuggestion)=>void}){
  const [nextLocation,setNextLocation]=useState(location),[nextRadius,setNextRadius]=useState(radius),[suggestions,setSuggestions]=useState<PlaceSuggestion[]>([]),[chosen,setChosen]=useState<PlaceSuggestion|undefined>();
  useEffect(()=>{if(nextLocation.trim().length<3||chosen?.label===nextLocation){setSuggestions([]);return}const controller=new AbortController(),timer=setTimeout(async()=>{try{const url=new URL("https://photon.komoot.io/api/");url.searchParams.set("q",`${nextLocation}, Brasil`);url.searchParams.set("limit","6");const response=await fetch(url,{signal:controller.signal});if(!response.ok)return;const data=await response.json() as {features?:Array<{geometry:{coordinates:[number,number]};properties:{name?:string;city?:string;district?:string;state?:string;country?:string;countrycode?:string;postcode?:string}}>};const places=(data.features||[]).filter(f=>f.properties.countrycode?.toUpperCase()==="BR"||f.properties.country==="Brasil").map(f=>{const p=f.properties,label=[p.name,p.district!==p.name?p.district:null,p.city!==p.name?p.city:null,p.state,p.postcode].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join(", ");return{label,longitude:f.geometry.coordinates[0],latitude:f.geometry.coordinates[1],postcode:p.postcode}});setSuggestions(places)}catch{setSuggestions([])}},350);return()=>{clearTimeout(timer);controller.abort()}},[nextLocation,chosen]);
  return <div className="overlay" onMouseDown={(e)=>e.target===e.currentTarget&&close()}><form className="sheet preference-sheet" onSubmit={(e)=>{e.preventDefault();save(nextLocation.trim(),nextRadius,chosen)}}><header><span><small>SUA ÁREA</small><h2>Localização e raio</h2></span><button type="button" onClick={close}>×</button></header><label className="location-autocomplete">Cidade, bairro ou CEP<input required autoComplete="off" value={nextLocation} onChange={(e)=>{setNextLocation(e.target.value);setChosen(undefined)}} placeholder="Ex. Santo Amaro, São Paulo"/>{suggestions.length>0&&<div className="location-suggestions">{suggestions.map((place)=><button type="button" key={`${place.latitude}-${place.longitude}`} onClick={()=>{setNextLocation(place.label);setChosen(place);setSuggestions([])}}><i>⌖</i><span>{place.label}</span></button>)}</div>}</label><label className="radius-label"><span>Mostrar mercados até <b>{nextRadius} km</b></span><input type="range" min="1" max="50" value={nextRadius} onChange={(e)=>setNextRadius(Number(e.target.value))}/><footer><small>1 km</small><small>50 km</small></footer></label><div className="preference-note">A localização e o raio serão usados para filtrar supermercados. Produtos de casa e eletro continuam mostrando ofertas com envio nacional.</div><button className="primary">Salvar preferências</button></form></div>;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null | undefined>(undefined);
  const [authError, setAuthError] = useState("");

  useEffect(() => onAuthStateChanged(auth, setCurrentUser), []);

  async function enterWithGoogle() {
    setAuthError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch {
      setAuthError("No pudimos abrir tu cuenta de Google. Revisá los dominios autorizados e intentá nuevamente.");
    }
  }

  if (currentUser === undefined)
    return <main className="auth-gate loading"><div className="auth-logo">S</div><p>Cargando ShopCerto…</p></main>;

  if (!currentUser)
    return <main className="auth-gate"><section><div className="auth-brand"><i>S</i><span>shop<b>certo</b></span></div><div className="auth-welcome"><small>AHORRÁ DE FORMA SIMPLE</small><h1>Tu lista de precios,<br/>siempre con vos.</h1><p>Creá una cuenta o iniciá sesión para guardar productos, comparar ofertas y recibir alertas.</p></div><button onClick={enterWithGoogle}><span>G</span>Registrarse o iniciar sesión</button><em>Acceso seguro mediante Google</em>{authError&&<div className="auth-message">{authError}</div>}<footer>Al continuar aceptás nuestros términos y política de privacidad.</footer></section></main>;

  return <ShopApp />;
}
