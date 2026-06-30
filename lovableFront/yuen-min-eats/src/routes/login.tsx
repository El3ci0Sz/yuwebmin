import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { store } from "@/lib/store";
import logo from "@/assets/yuenmin-logo.png";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar · YuWebMin" },
      { name: "description", content: "Acesse sua conta YuWebMin para acompanhar pedidos e fidelidade." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const displayName = mode === "signup" && name ? name : email.split("@")[0] || "Cliente";
    store.login(displayName, email);
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: "var(--gradient-hero)" }}>
      <div className="w-full max-w-md bg-card rounded-3xl shadow-[var(--shadow-warm)] border border-border p-8">
        <Link to="/" className="flex flex-col items-center gap-2 mb-6">
          <img src={logo} alt="Yuen Min" className="h-16 w-16 rounded-full ring-2 ring-primary/30" />
          <span className="text-2xl font-bold text-primary">YuWebMin</span>
          <span className="text-xs text-muted-foreground">Restaurante Vegetariano Yuen Min 圓明</span>
        </Link>

        <div className="flex p-1 bg-secondary rounded-full mb-6 text-sm font-medium">
          <button onClick={() => setMode("login")} className={`flex-1 py-2 rounded-full transition-colors ${mode === "login" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}>Entrar</button>
          <button onClick={() => setMode("signup")} className={`flex-1 py-2 rounded-full transition-colors ${mode === "signup" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}>Cadastrar</button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Seu nome" />
            </div>
          )}
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="voce@email.com" />
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full rounded-full" size="lg">
            {mode === "login" ? "Entrar" : "Criar conta"}
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground mt-6">
          Ao continuar você concorda com os termos do YuWebMin.<br />
          <span className="text-[10px]">Dica: e-mails contendo "admin" abrem o painel administrativo.</span>
        </p>
      </div>
    </div>
  );
}
