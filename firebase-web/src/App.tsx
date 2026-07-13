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
  createdAt?: unknown;
};
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
    [offers, setOffers] = useState<Offer[]>([]),
    [open, setOpen] = useState(false),
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
    getDocs(collection(db, "offers")).then((s) => {
      if (!s.empty)
        setOffers(s.docs.map((d) => ({ id: d.id, ...d.data() }) as Offer));
    });
  }, []);
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
  const savings = useMemo(
    () =>
      offers.reduce(
        (n, o) => n + Math.max(0, (o.oldPrice || o.price) - o.price),
        0,
      ),
    [offers],
  );
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
        <button className="place" onClick={() => setTab("perfil")}>
          ⌖ São Paulo, SP
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
              <article>
                🛒
                <span>
                  <b>Supermercado</b>
                  <small>Ofertas na sua região</small>
                </span>
              </article>
              <article>
                🏠
                <span>
                  <b>Casa e eletro</b>
                  <small>Envio para todo Brasil</small>
                </span>
              </article>
            </section>
            <Title
              over="ATUALIZADO DIARIAMENTE"
              title="Melhores ofertas"
              sub={`${offers.length} ofertas disponíveis`}
            />
            <div className="cards">
              {offers.map((o) => (
                <OfferCard key={o.id} o={o} />
              ))}
            </div>
            <div className="saving">
              ✨{" "}
              <span>
                <b>Economia encontrada</b>
                <small>{money(savings)} comparando os preços atuais</small>
              </span>
            </div>
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
                    <div>🛍️</div>
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
            <Empty
              icon="☷"
              text="As listas estarão disponíveis na próxima atualização gratuita."
            />
          </>
        )}
        {tab === "alertas" && (
          <>
            <Title
              over="AVISAMOS VOCÊ"
              title="Alertas"
              sub="Quedas de preço e ofertas"
            />
            <Empty
              icon="🔔"
              text="Salve um produto para criar seu primeiro alerta."
            />
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
                  <button>
                    ⌖
                    <span>
                      <b>Localização</b>
                      <small>São Paulo, SP</small>
                    </span>
                    ›
                  </button>
                  <button>
                    ◎
                    <span>
                      <b>Raio de busca</b>
                      <small>10 km</small>
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
            await addDoc(collection(db, "users", user.uid, "products"), {
              ...p,
              createdAt: serverTimestamp(),
            });
            setOpen(false);
            notify("Produto salvo no seu perfil");
          }}
        />
      )}
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
function OfferCard({ o }: { o: Offer }) {
  const total = o.price + (o.shipping || 0),
    drop = o.oldPrice ? Math.round((1 - o.price / o.oldPrice) * 100) : 0;
  return (
    <article className="offer">
      <div className="offer-top">
        <div className="pic">{o.product.includes("TV") ? "📺" : "☕"}</div>
        <span>
          <em>{o.scope}</em>
          <b>{o.product}</b>
          <small>{o.brand}</small>
        </span>
        <i>♡</i>
      </div>
      <div className="price">
        <small>Melhor preço</small>
        <b>{money(o.price)}</b>
        {o.oldPrice && <del>{money(o.oldPrice)}</del>}
        <em>↓ {drop}%</em>
      </div>
      <footer>
        <span>{o.store}</span>
        <b>Total {money(total)}</b>
      </footer>
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
function Empty({ icon, text }: { icon: string; text: string }) {
  return (
    <section className="empty">
      <i>{icon}</i>
      <p>{text}</p>
    </section>
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
