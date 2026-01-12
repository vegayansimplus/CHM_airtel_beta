import { Button, TextField } from "@mui/material";

interface Props {
  olmId: string;
  password: string;
  setOlmId: (v: string) => void;
  setPassword: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error?: string;
}

const LoginForm = ({
  olmId,
  password,
  setOlmId,
  setPassword,
  onSubmit,
  loading,
  error,
}: Props) => (
  <>
    <TextField
      label="OLM ID"
      value={olmId}
      onChange={(e) => setOlmId(e.target.value)}
      fullWidth
    />
    <TextField
      label="Password"
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      fullWidth
    />
    {error && <p style={{ color: "red" }}>{error}</p>}
    <Button fullWidth variant="contained" onClick={onSubmit} disabled={loading}>
      Login
    </Button>
  </>
);

export default LoginForm;
