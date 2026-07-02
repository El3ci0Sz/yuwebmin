import { Link, useNavigate } from "@tanstack/react-router";
import {
  ShoppingBag,
  User as UserIcon,
  LogOut,
  Menu as MenuIcon,
  X,
  ShieldCheck,
  ClipboardList,
} from "lucide-react";
import { useState } from "react";
import logo from "@/assets/yuenmin-logo.png";
import { store, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const user = useStore(() => store.getUser());
  const cartCount = useStore(() => store.getCart().reduce((s, i) => s + i.qty, 0));
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const navLink =
    "px-3 py-2 rounded-full text-sm font-medium text-foreground/80 hover:text-primary hover:bg-secondary transition-colors";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 mr-2">
            <img
              src={logo}
              alt="Yuen Min"
              className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/30"
            />
            <span className="font-bold text-lg tracking-tight text-primary">YuWebMin</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 ml-4">
            <Link
              to="/"
              className={navLink}
              activeProps={{ className: navLink + " !text-primary !bg-secondary" }}
              activeOptions={{ exact: true }}
            >
              Home
            </Link>
            <Link
              to="/cardapio"
              className={navLink}
              activeProps={{ className: navLink + " !text-primary !bg-secondary" }}
            >
              Cardápio
            </Link>
            <Link
              to="/pedido"
              className={navLink}
              activeProps={{ className: navLink + " !text-primary !bg-secondary" }}
            >
              Criar Pedido
            </Link>
            <Link
              to="/pedidos"
              className={navLink}
              activeProps={{ className: navLink + " !text-primary !bg-secondary" }}
            >
              Meus Pedidos
            </Link>
            {user?.role === "admin" && (
              <>
                <span className="mx-1 h-5 w-px bg-border" aria-hidden />
                <Link
                  to="/admin/cardapio"
                  className={navLink + " inline-flex items-center gap-1"}
                  activeProps={{
                    className:
                      navLink + " !text-primary !bg-secondary inline-flex items-center gap-1",
                  }}
                >
                  <ShieldCheck className="h-3.5 w-3.5" /> Gestão
                </Link>
                <Link
                  to="/admin/pedidos"
                  className={navLink + " inline-flex items-center gap-1"}
                  activeProps={{
                    className:
                      navLink + " !text-primary !bg-secondary inline-flex items-center gap-1",
                  }}
                >
                  <ClipboardList className="h-3.5 w-3.5" /> Pedidos
                </Link>
                <Link
                  to="/admin/financeiro"
                  className={navLink}
                  activeProps={{ className: navLink + " !text-primary !bg-secondary" }}
                >
                  Financeiro
                </Link>
              </>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/pedido"
              className="relative inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-secondary transition-colors"
              aria-label="Carrinho"
            >
              <ShoppingBag className="h-5 w-5 text-foreground/80" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <Link
                to="/conta"
                className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-secondary"
              >
                <span className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center font-semibold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="text-sm font-medium">{user.name.split(" ")[0]}</span>
              </Link>
            ) : (
              <Button size="sm" onClick={() => navigate({ to: "/login" })}>
                Entrar
              </Button>
            )}

            <button
              className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-secondary"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-4 py-3 flex flex-col gap-1">
              {[
                { to: "/" as const, label: "Home" },
                { to: "/cardapio" as const, label: "Cardápio" },
                { to: "/pedido" as const, label: "Criar Pedido" },
                { to: "/pedidos" as const, label: "Meus Pedidos" },
                { to: "/conta" as const, label: "Minha Conta" },
                ...(user?.role === "admin"
                  ? [
                      { to: "/admin/cardapio" as const, label: "Gestão de Cardápio" },
                      { to: "/admin/pedidos" as const, label: "Gestão de Pedidos" },
                      { to: "/admin/financeiro" as const, label: "Financeiro" },
                    ]
                  : []),
              ].map((l) => (
                <Link key={l.to} to={l.to} className={navLink} onClick={() => setOpen(false)}>
                  {l.label}
                </Link>
              ))}
              {user && (
                <button
                  className={navLink + " text-left flex items-center gap-2"}
                  onClick={() => {
                    store.logout();
                    setOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4" /> Sair
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-secondary/50 mt-16">
        <div className="mx-auto max-w-6xl px-4 py-8 grid sm:grid-cols-3 gap-6 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <img src={logo} alt="" className="h-8 w-8 rounded-full" />
              <span className="font-bold text-primary">Yuen Min 圓明</span>
            </div>
            <p className="text-muted-foreground">
              Restaurante Vegetariano · Comida feita com afeto.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Horário</h4>
            <p className="text-muted-foreground">Terça a Sexta · 11h às 14h</p>
            <p className="text-muted-foreground">Sábado · 11h às 14h30</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Contato</h4>
            <p className="text-muted-foreground">Atendimento local e delivery</p>
            <p className="text-muted-foreground">WhatsApp: (31) 99999-0000</p>
          </div>
        </div>
        <div className="text-center text-xs text-muted-foreground pb-6">
          © {new Date().getFullYear()} YuWebMin · Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
