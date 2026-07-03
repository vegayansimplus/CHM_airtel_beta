import {
  Box,
  Button,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  Table, TableBody, TableCell, TableHead, TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useMemo } from "react";
import {
  useGetAssignMatrixQuery,
  useGetAssignRulesQuery,
  useGetServiceRulesQuery,
} from "../../api/cabManagerApiSlice";
import {
  APPROVAL_AUTHORITIES,
  APPROVERS,
  ASSIGN_DOMAINS,
  ASSIGN_STAGES,
  SERVICE_CIRCLES,
  SERVICE_TYPES,
} from "../../data/cabManager.mock";

export function AdminAssignMatrixTab() {
  const matrix      = useGetAssignMatrixQuery();
  const rules       = useGetAssignRulesQuery();
  const serviceRules = useGetServiceRulesQuery();

  const matrixByStage = useMemo(() => {
    const map: Record<string, Record<string, string>> = {};
    matrix.data?.forEach((c) => { (map[c.stage] ??= {})[c.domain] = c.approver; });
    return map;
  }, [matrix.data]);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 2 }}>
        <Box sx={{ maxWidth: 620 }}>
          <Typography sx={{ fontWeight: 500, fontSize: 16 }}>Approval Assignment Matrix</Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Define who approves each CRQ by approval stage and domain. Exception rules below override
            this matrix for specific circle and impact combinations.
          </Typography>
        </Box>
        <Button size="small" variant="outlined">Reset to defaults</Button>
      </Stack>

      {/* Stage × Domain matrix */}
      <Paper sx={{ mb: 4, border: "1px solid", borderColor: "divider", overflow: "auto" }} elevation={0}>
        {matrix.isLoading ? (
          <Box sx={{ p: 2 }}><Skeleton variant="rounded" height={240} /></Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#FAFAFA" }}>
                <TableCell>Approval Stage</TableCell>
                {ASSIGN_DOMAINS.map((d) => <TableCell key={d}>{d}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {ASSIGN_STAGES.map((s) => (
                <TableRow key={s}>
                  <TableCell sx={{ fontWeight: 500 }}>{s}</TableCell>
                  {ASSIGN_DOMAINS.map((d) => (
                    <TableCell key={d}>
                      <TextField select size="small" value={matrixByStage[s]?.[d] ?? ""} fullWidth>
                        {APPROVERS.map((a) => (
                          <MenuItem key={a.name} value={a.name}>{a.name}</MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Exception rules */}
      <Paper sx={{ mb: 4, border: "1px solid", borderColor: "divider" }} elevation={0}>
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography sx={{ fontWeight: 500 }}>Exception Rules <Typography component="span" variant="caption" sx={{ color: "text.secondary", ml: 1 }}>— {rules.data?.filter((r) => r.active).length ?? 0} active</Typography></Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>Override the matrix for specific circle &amp; impact combinations.</Typography>
          </Box>
          <Button size="small" variant="contained" startIcon={<AddIcon />}>Add rule</Button>
        </Box>
        {rules.isLoading ? (
          <Box sx={{ p: 2 }}><Skeleton variant="rounded" height={180} /></Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#FAFAFA" }}>
                <TableCell>Rule</TableCell>
                <TableCell>Domain</TableCell>
                <TableCell>Circle</TableCell>
                <TableCell>Impact</TableCell>
                <TableCell>Stage</TableCell>
                <TableCell>Approver</TableCell>
                <TableCell align="center">Active</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rules.data?.map((r) => (
                <TableRow key={r.id} sx={{ opacity: r.active ? 1 : 0.6 }}>
                  <TableCell sx={{ fontFamily: "'Roboto Mono', monospace", color: "primary.main" }}>{r.id}</TableCell>
                  <TableCell>{r.domain}</TableCell>
                  <TableCell>{r.circle}</TableCell>
                  <TableCell>{r.impact}</TableCell>
                  <TableCell>{r.stage}</TableCell>
                  <TableCell>{r.approver}</TableCell>
                  <TableCell align="center">{r.active ? "Yes" : "No"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Impacted-party (L1/L2/L3) rules */}
      <Paper sx={{ border: "1px solid", borderColor: "divider" }} elevation={0}>
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography sx={{ fontWeight: 500 }}>Impacted Party Approval Flow <Typography component="span" variant="caption" sx={{ color: "text.secondary", ml: 1 }}>— {serviceRules.data?.filter((r) => r.active).length ?? 0} active</Typography></Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>L1 is the primary impacted-party approver; L2/L3 are escalation tiers.</Typography>
          </Box>
          <Button size="small" variant="contained" startIcon={<AddIcon />}>Add service</Button>
        </Box>
        {serviceRules.isLoading ? (
          <Box sx={{ p: 2 }}><Skeleton variant="rounded" height={180} /></Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#FAFAFA" }}>
                <TableCell>Rule</TableCell>
                <TableCell>Service Type</TableCell>
                <TableCell>Circle</TableCell>
                <TableCell>Impact</TableCell>
                <TableCell sx={{ color: "#2E7D32" }}>L1</TableCell>
                <TableCell sx={{ color: "#ED6C02" }}>L2</TableCell>
                <TableCell sx={{ color: "#C62828" }}>L3</TableCell>
                <TableCell align="center">Active</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {serviceRules.data?.map((r) => (
                <TableRow key={r.id} sx={{ opacity: r.active ? 1 : 0.6 }}>
                  <TableCell sx={{ fontFamily: "'Roboto Mono', monospace", color: "primary.main" }}>{r.id}</TableCell>
                  <TableCell>
                    <TextField select size="small" value={r.service} fullWidth>
                      {SERVICE_TYPES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </TextField>
                  </TableCell>
                  <TableCell>
                    <TextField select size="small" value={r.circle} fullWidth>
                      {SERVICE_CIRCLES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </TextField>
                  </TableCell>
                  <TableCell>
                    <TextField select size="small" value={r.impact} fullWidth>
                      <MenuItem value="SA">SA</MenuItem>
                      <MenuItem value="NSA">NSA</MenuItem>
                    </TextField>
                  </TableCell>
                  <TableCell>
                    <TextField select size="small" value={r.l1} fullWidth>
                      {APPROVAL_AUTHORITIES.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                    </TextField>
                  </TableCell>
                  <TableCell>
                    <TextField select size="small" value={r.l2} fullWidth>
                      {APPROVAL_AUTHORITIES.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                    </TextField>
                  </TableCell>
                  <TableCell>
                    <TextField select size="small" value={r.l3} fullWidth>
                      {APPROVAL_AUTHORITIES.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                    </TextField>
                  </TableCell>
                  <TableCell align="center">{r.active ? "Yes" : "No"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
}
