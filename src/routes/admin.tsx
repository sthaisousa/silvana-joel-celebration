import { useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  CircleDollarSign,
  Eye,
  EyeOff,
  Gift,
  LogOut,
  MessageCircle,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  deleteAdminGift,
  getAdminData,
  getAdminSession,
  loginAdmin,
  logoutAdmin,
  saveAdminGift,
  type AdminGift,
  type AdminGiftPurchase,
  type AdminMessage,
  type AdminRsvp,
} from "@/fns/admin";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Área dos noivos — Silvana & Joel" },
      { name: "description", content: "Gestão privada da lista de presentes e confirmações." },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
});

const money = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const priceInput = (cents: number) => (cents / 100).toFixed(2).replace(".", ",");

const welcomeMessages = [
  "Tentei falar com a Beyoncé para cantar no casamento, a gente tá negociando isso ainda.",
  "Quem estiver com tom próximo do branco também posso jogar fanta uva?",
  "Você está linda. Não consigo te ver, mas mantenho minha afirmação.",
  "Nenhuma mensagem profunda hoje. Vai trabalhar amiga. 😂",
  "Vim desejar bom dia. Mesmo que sejam 19h.",
  "Um dia isso aqui tudo vai virar memória. Aproveita também. 🤍",
  "Oi. 🙂",
  "Você de novo. 🙂",
  "VAI DAR TUDO CERTO. Fonte: eu decidi.",
  "Nenhum pensamento. Apenas 💍.",
  "Amiga vai comer uma frutinha",
  "Amiga você gosta da Katy Perry? A gente tá trocando uma ideia aqui e ela se interessou.",
  "Amiga vai algum vegano no casamento?",
  "A Dua Lipa aceitou cantar.",
  "Se você está lendo isso, o login funcionou. Tecnologia.",
  "A gente vai ter que adicionar o Joel no nosso point de encontro lá da cafeteria, né?",
] as const;

function AdminPage() {
  const queryClient = useQueryClient();
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);
  const session = useQuery({ queryKey: ["admin-session"], queryFn: getAdminSession, retry: false });
  const authenticated = session.data?.authenticated === true;

  const login = useMutation({
    mutationFn: loginAdmin,
    onSuccess: () => {
      setWelcomeMessage(
        welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)],
      );
      queryClient.invalidateQueries({ queryKey: ["admin-session"] });
    },
  });
  const logout = useMutation({
    mutationFn: logoutAdmin,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["admin-data"] });
      queryClient.invalidateQueries({ queryKey: ["admin-session"] });
    },
  });

  if (session.isLoading) return <LoadingScreen />;
  if (!authenticated) return <LoginScreen onLogin={(password) => login.mutate({ data: { password } })} error={login.error} busy={login.isPending} />;

  return (
    <AdminWorkspace
      onLogout={() => logout.mutate()}
      loggingOut={logout.isPending}
      welcomeMessage={welcomeMessage}
      onCloseWelcome={() => setWelcomeMessage(null)}
    />
  );
}

function LoadingScreen() {
  return (
    <main className="min-h-[100dvh] bg-[#f5f0e8] p-6 sm:p-10">
      <div className="mx-auto max-w-6xl animate-pulse space-y-8">
        <div className="h-8 w-48 rounded bg-[#e5ddcf]" />
        <div className="grid gap-4 md:grid-cols-3"><div className="h-28 rounded bg-[#e5ddcf]" /><div className="h-28 rounded bg-[#e5ddcf]" /><div className="h-28 rounded bg-[#e5ddcf]" /></div>
        <div className="h-96 rounded bg-[#e5ddcf]" />
      </div>
    </main>
  );
}

function LoginScreen({ onLogin, error, busy }: { onLogin: (password: string) => void; error: Error | null; busy: boolean }) {
  const [password, setPassword] = useState("");
  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#26362d] px-5 py-12 text-[#f7f1e8]">
      <div className="absolute -right-24 -top-32 h-96 w-96 rounded-full border border-[#d6b477]/20" />
      <div className="absolute -bottom-48 -left-24 h-[32rem] w-[32rem] rounded-full border border-[#d6b477]/10" />
      <section className="relative w-full max-w-md">
        <div className="mb-12 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d6b477]/60 text-[#d6b477]"><ShieldCheck size={21} strokeWidth={1.3} /></div>
          <div><p className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#d6b477]">Silvana & Joel</p><p className="mt-1 font-serif text-lg">Área reservada</p></div>
        </div>
        <p className="mb-4 font-sans text-[11px] uppercase tracking-[0.28em] text-[#d6b477]">Bem-vindos de volta</p>
        <h1 className="font-serif text-5xl leading-[0.95] sm:text-6xl">Os bastidores<br /><em>do nosso dia.</em></h1>
        <p className="mt-7 max-w-sm font-sans text-sm font-light leading-relaxed text-[#dfe1d7]/70">Um espaço tranquilo para cuidar dos presentes e acompanhar quem estará conosco.</p>
        <form className="mt-12" onSubmit={(event) => { event.preventDefault(); onLogin(password); }}>
          <label className="font-sans text-[10px] uppercase tracking-[0.22em] text-[#dfe1d7]/70" htmlFor="admin-password">Senha de acesso</label>
          <input id="admin-password" autoFocus autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-3 w-full border-0 border-b border-[#dfe1d7]/30 bg-transparent px-0 py-3 font-sans text-lg outline-none transition-colors placeholder:text-[#dfe1d7]/30 focus:border-[#d6b477]" placeholder="Digite sua senha" />
          {error && <p className="mt-4 flex items-center gap-2 font-sans text-xs text-[#efb2a7]"><CircleAlert size={14} /> {error.message}</p>}
          <button disabled={!password || busy} className="mt-8 flex w-full items-center justify-between border border-[#d6b477] px-5 py-4 font-sans text-[11px] uppercase tracking-[0.2em] text-[#d6b477] transition-colors hover:bg-[#d6b477] hover:text-[#26362d] disabled:cursor-not-allowed disabled:opacity-40">
            {busy ? "Verificando..." : "Entrar"} <ArrowUpRight size={16} />
          </button>
        </form>
        <p className="mt-14 font-serif text-sm italic text-[#dfe1d7]/45">12 de dezembro de 2026 · Campo Grande</p>
      </section>
    </main>
  );
}

function AdminWorkspace({
  onLogout,
  loggingOut,
  welcomeMessage,
  onCloseWelcome,
}: {
  onLogout: () => void;
  loggingOut: boolean;
  welcomeMessage: string | null;
  onCloseWelcome: () => void;
}) {
  const queryClient = useQueryClient();
  const data = useQuery({ queryKey: ["admin-data"], queryFn: getAdminData, retry: 1 });
  const save = useMutation({ mutationFn: saveAdminGift, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-data"] }) });
  const remove = useMutation({ mutationFn: deleteAdminGift, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-data"] }) });
  const [editing, setEditing] = useState<AdminGift | null>(null);
  const [search, setSearch] = useState("");
  const [rsvpFilter, setRsvpFilter] = useState<"all" | "yes" | "no">("all");
  const gifts = data.data?.gifts ?? [];
  const rsvps = data.data?.rsvps ?? [];
  const purchases = data.data?.purchases ?? [];
  const messages = data.data?.messages ?? [];
  const activeGifts = gifts.filter((gift) => gift.active).length;
  const attending = rsvps.filter((rsvp) => rsvp.attending).length;
  const filteredRsvps = useMemo(() => rsvps.filter((rsvp) => {
    const matchesSearch = rsvp.name.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (rsvpFilter === "all" || (rsvpFilter === "yes" ? rsvp.attending : !rsvp.attending));
  }), [rsvps, search, rsvpFilter]);

  function submitGift(gift: AdminGift) {
    save.mutate({ data: gift }, { onSuccess: () => setEditing(null) });
  }
  function deleteGift(gift: AdminGift) {
    if (window.confirm(`Excluir "${gift.title}"? Esta ação não pode ser desfeita.`)) remove.mutate({ data: { id: gift.id } });
  }

  return (
    <main className="min-h-[100dvh] bg-[#f5f0e8] text-[#303a31]">
      <header className="border-b border-[#d9cfbf] bg-[#f8f4ed]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 sm:px-10">
          <div className="flex items-center gap-4"><div className="font-serif text-2xl tracking-tight text-[#26362d]">S <span className="text-[#b49159]">&</span> J</div><div className="hidden h-7 w-px bg-[#d9cfbf] sm:block" /><p className="hidden font-sans text-[10px] uppercase tracking-[0.22em] text-[#768073] sm:block">Área dos noivos</p></div>
          <button onClick={onLogout} disabled={loggingOut} className="flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.18em] text-[#768073] transition-colors hover:text-[#303a31]"><LogOut size={15} /> {loggingOut ? "Saindo..." : "Sair"}</button>
        </div>
      </header>
      <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-10 sm:py-14">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div><p className="font-sans text-[10px] uppercase tracking-[0.28em] text-[#b49159]">Visão geral</p><h1 className="mt-3 font-serif text-5xl text-[#26362d] sm:text-6xl">Tudo no seu lugar.</h1><p className="mt-3 max-w-md font-sans text-sm text-[#768073]">Presentes, respostas e os pequenos detalhes que antecedem o nosso encontro.</p></div>
          <p className="font-sans text-xs text-[#768073]">{new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date())}</p>
        </div>
        {data.isError && <div className="mb-8 flex items-center justify-between border border-[#c88977]/40 bg-[#f8e9e3] px-4 py-3 font-sans text-sm text-[#794e42]"><span>Não foi possível carregar os dados.</span><button onClick={() => data.refetch()} className="underline">Tentar novamente</button></div>}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat icon={<Gift size={18} />} label="Presentes ativos" value={data.isLoading ? "—" : `${activeGifts}`} detail={`${gifts.length} cadastrados`} />
          <Stat icon={<CircleDollarSign size={18} />} label="Presentes comprados" value={data.isLoading ? "—" : `${purchases.length}`} detail="pagamentos confirmados" accent />
          <Stat icon={<CheckCircle2 size={18} />} label="Confirmados" value={data.isLoading ? "—" : `${attending}`} detail={`de ${rsvps.length} respostas`} accent />
          <Stat icon={<Users size={18} />} label="Não confirmados" value={data.isLoading ? "—" : `${rsvps.length - attending}`} detail="não poderão comparecer" />
        </div>
        {data.data?.purchaseSyncError && (
          <div className="mt-6 flex items-center justify-between gap-4 border border-[#c88977]/40 bg-[#f8e9e3] px-4 py-3 font-sans text-sm text-[#794e42]">
            <span>Não foi possível consultar os pagamentos do Stripe agora.</span>
            <button onClick={() => data.refetch()} className="shrink-0 underline">
              Tentar novamente
            </button>
          </div>
        )}
        <div className="mt-12 grid gap-10 xl:grid-cols-[1.45fr_1fr]">
          <section className="min-w-0">
            <div className="mb-4 flex items-end justify-between gap-4"><div><p className="font-sans text-[10px] uppercase tracking-[0.24em] text-[#b49159]">Catálogo</p><h2 className="mt-2 font-serif text-3xl text-[#26362d]">Lista de presentes</h2></div><button onClick={() => setEditing({ id: 0, title: "", description: "", price_cents: 0, active: true, sort_order: gifts.length })} className="flex items-center gap-2 border border-[#b49159] px-4 py-2.5 font-sans text-[10px] uppercase tracking-[0.18em] text-[#806338] transition-colors hover:bg-[#b49159] hover:text-[#fffaf2]"><Plus size={15} /> Novo presente</button></div>
            <div className="overflow-hidden border border-[#d9cfbf] bg-[#fbf8f2]">
              {data.isLoading ? <GiftSkeleton /> : gifts.length === 0 ? <Empty icon={<Gift size={22} />} title="Nenhum presente ainda" action={() => setEditing({ id: 0, title: "", description: "", price_cents: 0, active: true, sort_order: 0 })} /> : gifts.map((gift) => <GiftRow key={gift.id} gift={gift} onEdit={() => setEditing(gift)} onDelete={() => deleteGift(gift)} onToggle={() => submitGift({ ...gift, active: !gift.active })} busy={save.isPending || remove.isPending} />)}
            </div>
          </section>
          <section className="min-w-0">
            <div className="mb-4"><p className="font-sans text-[10px] uppercase tracking-[0.24em] text-[#b49159]">Lista de presença</p><h2 className="mt-2 font-serif text-3xl text-[#26362d]">Quem vem celebrar</h2></div>
            <div className="border border-[#d9cfbf] bg-[#fbf8f2]">
               <div className="flex flex-col gap-3 border-b border-[#d9cfbf] p-4 sm:flex-row"><div className="relative flex-1"><Search size={15} className="absolute left-0 top-2.5 text-[#9ca096]" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome" className="w-full border-0 border-b border-[#d9cfbf] bg-transparent py-2 pl-7 font-sans text-sm outline-none focus:border-[#b49159]" /></div><div className="relative"><select value={rsvpFilter} onChange={(e) => setRsvpFilter(e.target.value as typeof rsvpFilter)} className="w-full appearance-none border border-[#d9cfbf] bg-transparent px-3 py-2 pr-8 font-sans text-[10px] uppercase tracking-[0.12em] outline-none"><option value="all">Todas as respostas</option><option value="yes">Confirmados</option><option value="no">Não confirmados</option></select><ChevronDown size={13} className="pointer-events-none absolute right-2 top-2.5" /></div></div>
              {data.isLoading ? <RsvpSkeleton /> : filteredRsvps.length === 0 ? <Empty icon={<Users size={22} />} title={rsvps.length ? "Nenhum nome encontrado" : "Nenhuma confirmação ainda"} /> : <div className="divide-y divide-[#e4dbce]">{filteredRsvps.map((rsvp) => <RsvpRow key={rsvp.id} rsvp={rsvp} />)}</div>}
              {filteredRsvps.length > 0 && <p className="border-t border-[#d9cfbf] px-4 py-3 font-sans text-[10px] uppercase tracking-[0.12em] text-[#9ca096]">{filteredRsvps.length} {filteredRsvps.length === 1 ? "pessoa" : "pessoas"} exibidas</p>}
            </div>
          </section>
        </div>
        <section className="mt-12 min-w-0">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-[#b49159]">
                Mural dos convidados
              </p>
              <h2 className="mt-2 font-serif text-3xl text-[#26362d]">
                Recados deixados aos noivos
              </h2>
            </div>
            <span className="font-sans text-[10px] uppercase tracking-[0.14em] text-[#9ca096]">
              {messages.length} {messages.length === 1 ? "recado" : "recados"}
            </span>
          </div>
          <div className="overflow-hidden border border-[#d9cfbf] bg-[#fbf8f2]">
            {data.isLoading ? (
              <GiftSkeleton />
            ) : messages.length === 0 ? (
              <Empty
                icon={<MessageCircle size={22} />}
                title="Nenhum recado recebido ainda"
              />
            ) : (
              <div className="grid divide-y divide-[#e4dbce] md:grid-cols-2 md:divide-y-0">
                {messages.map((message) => (
                  <MessageCard key={message.id} message={message} />
                ))}
              </div>
            )}
          </div>
        </section>
        <section className="mt-12 min-w-0">
          <div className="mb-4">
            <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-[#b49159]">
              Stripe
            </p>
            <h2 className="mt-2 font-serif text-3xl text-[#26362d]">
              Presentes efetivamente comprados
            </h2>
            <p className="mt-2 font-sans text-xs text-[#768073]">
              Somente pagamentos confirmados pelo Stripe aparecem nesta lista.
            </p>
          </div>
          <div className="overflow-hidden border border-[#d9cfbf] bg-[#fbf8f2]">
            {data.isLoading ? (
              <GiftSkeleton />
            ) : purchases.length === 0 ? (
              <Empty
                icon={<CircleDollarSign size={22} />}
                title="Nenhum presente comprado ainda"
              />
            ) : (
              <div className="divide-y divide-[#e4dbce]">
                {purchases.map((purchase) => (
                  <PurchaseRow key={purchase.id} purchase={purchase} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
      {editing && <GiftEditor gift={editing} onClose={() => setEditing(null)} onSave={submitGift} saving={save.isPending} />}
      {welcomeMessage && (
        <WelcomeModal message={welcomeMessage} onClose={onCloseWelcome} />
      )}
    </main>
  );
}

function WelcomeModal({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#26362d]/55 p-5 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        className="relative w-full max-w-lg border border-[#d6b477]/60 bg-[#fbf8f2] px-7 py-9 text-center shadow-2xl sm:px-12 sm:py-12"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar mensagem"
          className="absolute right-4 top-4 p-2 text-[#8b9188] transition-colors hover:text-[#303a31]"
        >
          <X size={18} />
        </button>
        <p className="font-sans text-[10px] uppercase tracking-[0.26em] text-[#b49159]">
          Área dos noivos
        </p>
        <h2
          id="welcome-title"
          className="mt-5 font-serif text-3xl leading-snug text-[#26362d] sm:text-4xl"
        >
          {message}
        </h2>
        <button
          type="button"
          autoFocus
          onClick={onClose}
          className="mt-9 border border-[#26362d] px-7 py-3 font-sans text-[10px] uppercase tracking-[0.18em] text-[#26362d] transition-colors hover:bg-[#26362d] hover:text-[#f7f1e8]"
        >
          Continuar
        </button>
      </section>
    </div>
  );
}

function Stat({ icon, label, value, detail, accent }: { icon: ReactNode; label: string; value: string; detail: string; accent?: boolean }) {
  return <div className={`border p-5 ${accent ? "border-[#b49159]/50 bg-[#eee4d2]" : "border-[#d9cfbf] bg-[#fbf8f2]"}`}><div className="flex items-center justify-between"><span className="text-[#b49159]">{icon}</span><span className="font-sans text-[10px] uppercase tracking-[0.16em] text-[#9ca096]">{label}</span></div><div className="mt-5 flex items-end justify-between"><strong className="font-serif text-4xl font-normal text-[#26362d]">{value}</strong><span className="font-sans text-[11px] text-[#768073]">{detail}</span></div></div>;
}

function GiftRow({ gift, onEdit, onDelete, onToggle, busy }: { gift: AdminGift; onEdit: () => void; onDelete: () => void; onToggle: () => void; busy: boolean }) {
  return <div className={`group grid gap-3 border-b border-[#e4dbce] p-4 transition-colors last:border-0 sm:grid-cols-[1fr_auto] sm:items-center ${!gift.active ? "opacity-55" : "hover:bg-[#f7f1e7]"}`}><div className="min-w-0"><div className="flex items-center gap-2"><h3 className="truncate font-sans text-sm font-medium text-[#303a31]">{gift.title || "Sem título"}</h3><span className={`shrink-0 rounded-full px-2 py-0.5 font-sans text-[9px] uppercase tracking-[0.1em] ${gift.active ? "bg-[#dfe7d8] text-[#587052]" : "bg-[#e6e2db] text-[#88867f]"}`}>{gift.active ? "ativo" : "oculto"}</span></div><p className="mt-1 line-clamp-1 font-sans text-xs text-[#8b9188]">{gift.description}</p></div><div className="flex items-center justify-between gap-4 sm:justify-end"><strong className="font-serif text-lg font-normal text-[#806338]">{money(gift.price_cents)}</strong><div className="flex items-center gap-1 border-l border-[#d9cfbf] pl-3"><button title={gift.active ? "Desativar" : "Ativar"} onClick={onToggle} disabled={busy} className="p-2 text-[#8b9188] hover:text-[#806338]">{gift.active ? <EyeOff size={15} /> : <Eye size={15} />}</button><button title="Editar" onClick={onEdit} className="p-2 font-sans text-[10px] uppercase tracking-[0.12em] text-[#768073] hover:text-[#303a31]">Editar</button><button title="Excluir" onClick={onDelete} disabled={busy} className="p-2 text-[#b57b6b] hover:text-[#8d4d3f]"><Trash2 size={15} /></button></div></div></div>;
}

function RsvpRow({ rsvp }: { rsvp: AdminRsvp }) {
  return <div className="flex items-center justify-between gap-3 px-4 py-3.5"><div className="flex min-w-0 items-center gap-3"><div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-serif text-sm ${rsvp.attending ? "bg-[#dfe7d8] text-[#587052]" : "bg-[#e9e1d5] text-[#8b8174]"}`}>{rsvp.name.charAt(0).toUpperCase()}</div><div className="min-w-0"><p className="truncate font-sans text-sm text-[#303a31]">{rsvp.name}</p><p className="font-sans text-[10px] text-[#a0a49d]">{new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(rsvp.created_at))}</p></div></div><span className={`flex shrink-0 items-center gap-1.5 font-sans text-[10px] uppercase tracking-[0.1em] ${rsvp.attending ? "text-[#587052]" : "text-[#9b8d7d]"}`}>{rsvp.attending ? <><Check size={13} /> Confirmado</> : "Não confirmado"}</span></div>;
}

function PurchaseRow({ purchase }: { purchase: AdminGiftPurchase }) {
  const buyer = purchase.buyer_name || purchase.buyer_email || "Convidado";
  const date = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(purchase.created_at));

  return (
    <div className="grid gap-3 px-4 py-4 sm:grid-cols-[1fr_auto] sm:items-center sm:px-5">
      <div className="min-w-0">
        <p className="font-sans text-sm font-medium text-[#303a31]">
          {purchase.gift_title}
        </p>
        <p className="mt-1 truncate font-sans text-xs text-[#8b9188]">
          {buyer}
          {purchase.buyer_name && purchase.buyer_email
            ? ` · ${purchase.buyer_email}`
            : ""}
        </p>
      </div>
      <div className="flex items-center justify-between gap-5 sm:justify-end">
        <div className="text-right">
          <p className="font-serif text-lg text-[#806338]">
            {money(purchase.amount_total)}
          </p>
          <p className="font-sans text-[10px] text-[#a0a49d]">{date}</p>
        </div>
        <span className="flex items-center gap-1.5 font-sans text-[9px] uppercase tracking-[0.1em] text-[#587052]">
          <Check size={13} />
          Pago
        </span>
      </div>
    </div>
  );
}

function MessageCard({ message }: { message: AdminMessage }) {
  const date = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(message.created_at));

  return (
    <article className="border-[#e4dbce] p-5 md:border-b md:odd:border-r sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eee4d2] text-[#806338]">
          <MessageCircle size={16} />
        </div>
        <time className="font-sans text-[10px] text-[#a0a49d]">{date}</time>
      </div>
      <blockquote className="mt-5 font-serif text-xl italic leading-relaxed text-[#303a31]">
        “{message.message}”
      </blockquote>
      <p className="mt-4 font-sans text-[10px] uppercase tracking-[0.16em] text-[#806338]">
        {message.name}
      </p>
    </article>
  );
}

function Empty({ icon, title, action }: { icon: ReactNode; title: string; action?: () => void }) {
  return <div className="flex flex-col items-center justify-center px-6 py-16 text-center"><span className="text-[#b49159]">{icon}</span><p className="mt-4 font-serif text-xl text-[#596158]">{title}</p>{action && <button onClick={action} className="mt-4 font-sans text-[10px] uppercase tracking-[0.16em] text-[#806338] underline underline-offset-4">Adicionar o primeiro</button>}</div>;
}
function GiftSkeleton() { return <div className="animate-pulse divide-y divide-[#e4dbce]">{[1, 2, 3, 4].map((i) => <div key={i} className="space-y-2 p-5"><div className="h-4 w-2/3 rounded bg-[#e6ded1]" /><div className="h-3 w-1/2 rounded bg-[#eee8df]" /></div>)}</div>; }
function RsvpSkeleton() { return <div className="animate-pulse divide-y divide-[#e4dbce]">{[1, 2, 3].map((i) => <div key={i} className="flex gap-3 p-4"><div className="h-8 w-8 rounded-full bg-[#e6ded1]" /><div className="space-y-2"><div className="h-3 w-32 rounded bg-[#e6ded1]" /><div className="h-2 w-16 rounded bg-[#eee8df]" /></div></div>)}</div>; }

function GiftEditor({ gift, onClose, onSave, saving }: { gift: AdminGift; onClose: () => void; onSave: (gift: AdminGift) => void; saving: boolean }) {
  const [draft, setDraft] = useState({ ...gift, price: priceInput(gift.price_cents) });
  const update = (key: keyof typeof draft, value: string | boolean) => setDraft((current) => ({ ...current, [key]: value }));
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#26362d]/40 p-0 backdrop-blur-sm sm:items-center sm:p-6"><div className="w-full max-w-xl border border-[#d9cfbf] bg-[#fbf8f2] shadow-2xl"><div className="flex items-start justify-between border-b border-[#d9cfbf] p-6"><div><p className="font-sans text-[10px] uppercase tracking-[0.23em] text-[#b49159]">{gift.id ? "Editar presente" : "Novo presente"}</p><h2 className="mt-2 font-serif text-3xl text-[#26362d]">{gift.id ? "Ajuste os detalhes" : "Adicionar à lista"}</h2></div><button onClick={onClose} className="text-[#768073] hover:text-[#303a31]"><X size={20} /></button></div><form onSubmit={(e) => { e.preventDefault(); const parsed = Number(String(draft.price).replace(/\./g, "").replace(",", ".")); onSave({ id: draft.id, title: draft.title, description: draft.description, price_cents: Math.round(parsed * 100), active: draft.active, sort_order: Number(draft.sort_order) || 0 }); }} className="space-y-5 p-6"><label className="block"><span className="font-sans text-[10px] uppercase tracking-[0.16em] text-[#768073]">Nome do presente</span><input required maxLength={255} value={draft.title} onChange={(e) => update("title", e.target.value)} className="mt-2 w-full border-b border-[#d9cfbf] bg-transparent py-2 font-sans text-sm outline-none focus:border-[#b49159]" /></label><label className="block"><span className="font-sans text-[10px] uppercase tracking-[0.16em] text-[#768073]">Descrição</span><textarea required maxLength={2000} rows={3} value={draft.description} onChange={(e) => update("description", e.target.value)} className="mt-2 w-full resize-none border border-[#d9cfbf] bg-transparent p-3 font-sans text-sm outline-none focus:border-[#b49159]" /></label><div className="grid gap-5 sm:grid-cols-2"><label className="block"><span className="font-sans text-[10px] uppercase tracking-[0.16em] text-[#768073]">Valor em reais</span><div className="mt-2 flex items-center border-b border-[#d9cfbf]"><span className="font-serif text-lg text-[#b49159]">R$</span><input required inputMode="decimal" value={draft.price} onChange={(e) => update("price", e.target.value)} className="w-full bg-transparent py-2 pl-2 font-sans text-sm outline-none" /></div></label><label className="block"><span className="font-sans text-[10px] uppercase tracking-[0.16em] text-[#768073]">Ordem na lista</span><input type="number" value={draft.sort_order} onChange={(e) => update("sort_order", e.target.value)} className="mt-2 w-full border-b border-[#d9cfbf] bg-transparent py-2 font-sans text-sm outline-none focus:border-[#b49159]" /></label></div><label className="flex cursor-pointer items-center gap-3 font-sans text-sm text-[#596158]"><input type="checkbox" checked={draft.active} onChange={(e) => update("active", e.target.checked)} className="accent-[#b49159]" /> Visível para os convidados</label><div className="flex justify-end gap-3 border-t border-[#d9cfbf] pt-5"><button type="button" onClick={onClose} className="px-4 py-2.5 font-sans text-[10px] uppercase tracking-[0.16em] text-[#768073]">Cancelar</button><button disabled={saving} className="bg-[#26362d] px-5 py-2.5 font-sans text-[10px] uppercase tracking-[0.16em] text-[#f7f1e8] hover:bg-[#415445] disabled:opacity-50">{saving ? "Salvando..." : "Salvar presente"}</button></div></form></div></div>;
}