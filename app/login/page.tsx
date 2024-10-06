import { login, signup } from "./actions";

export default function LoginPage() {
  return (
    <form>
      <label htmlFor="email" className="text-primary-foreground">
        Email:
      </label>
      <input id="email" name="email" type="email" required />
      <label htmlFor="password" className="text-primary-foreground">
        Password:
      </label>
      <input id="password" name="password" type="password" required />
      <button formAction={login} className="text-primary-foreground">
        Log in
      </button>
      <button formAction={signup} className="text-primary-foreground">
        Sign up
      </button>
    </form>
  );
}
