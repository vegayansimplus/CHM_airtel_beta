import { alpha, Box, Chip, IconButton, InputAdornment, LinearProgress, Stack, Tab, Tabs, TextField, Typography, useTheme } from "@mui/material";
import type { InboxItem } from "./TaskInbox";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import { AppScrollView } from "../../../components/ui/AppScrollView";

// --- Middle List Panel ---
export const NotificationList = ({
  filterTab,
  setFilterTab,
  searchQuery,
  setSearchQuery,
  filteredData,
  isLoading,
  selectedItemId,
  setSelectedItemId,
  onOpenMenu,
  activeMenuName,
}: any) => {
  const theme = useTheme();

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        sx={{ borderBottom: 1, borderColor: "divider", px: 2, pt: 1, pb: 0.5, }}

      >
        <IconButton
          sx={{ display: { xs: "block", md: "none" }, mr: 1 }}
          onClick={onOpenMenu}
          edge="start"
        >
          <MenuIcon />
        </IconButton>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            flex: 1,
            display: { xs: "block", md: "none" },
          }}
        >
          {activeMenuName}
        </Typography>
        <Tabs
          value={filterTab}
          onChange={(_, v) => setFilterTab(v)}
          sx={{
            minHeight: 40,
            flex: { xs: 0, md: 1 },
            "& .MuiTab-root": {
              textTransform: "none",
              minWidth: "auto",
              px: 2,
              fontWeight: 600,
              fontSize: "0.875rem",
            },
            "& .MuiTabs-indicator": { height: 3, borderRadius: "3px 3px 0 0" },
          }}
        >
          <Tab label="All" />
          <Tab label="Unread" />
        </Tabs>
      </Stack>

      <Box sx={{ p: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder={`Search ${activeMenuName.toLowerCase()}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              bgcolor: "background.paper",
            },
          }}
        />
      </Box>

      <AppScrollView
        sx={{
          flex: 1,
          overflowY: "auto",
          
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            background: alpha(theme.palette.text.secondary, 0.3),
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: alpha(theme.palette.text.secondary, 0.5),
          },
        }}
      >
        {isLoading && <LinearProgress sx={{ height: 2 }} />}

        {filteredData.length === 0 && !isLoading && (
          <Typography
            textAlign="center"
            color="text.secondary"
            sx={{ mt: 4, fontSize: 14 }}
          >
            No matching items found in {activeMenuName}.
          </Typography>
        )}

        {filteredData.map((item: InboxItem) => {
          const isSelected = item.id === selectedItemId;
          const previewText =
            item.message.replace(/\n/g, " ").substring(0, 60) + "...";

          return (
            <Box
              key={item.id}
              onClick={() => setSelectedItemId(item.id)}
              sx={{
                backgroundColor:"red",
                p: 1.5,
                cursor: "pointer",
                borderBottom: `1px solid ${theme.palette.divider}`,
                bgcolor: isSelected
                  ? alpha(theme.palette.primary.main, 0.04)
                  : "transparent",
                borderLeft: `4px solid ${isSelected ? theme.palette.primary.main : "transparent"}`,
                transition: "all 0.2s ease",
                "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.02) },
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                mb={0.5}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: item.isUnread ? 700 : 500,
                    color: "text.primary",
                  }}
                >
                  {item.shortTitle}
                </Typography>
                {item.isUnread && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      mt: 0.5,
                      flexShrink: 0,
                    }}
                  />
                )}
              </Stack>

              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  mb: 1.5,
                  fontSize: "0.8rem",
                  lineHeight: 1.4,
                }}
              >
                {previewText}
              </Typography>

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontWeight: 500 }}
                >
                  {item.date} • {item.time}
                </Typography>
                <Chip
                  label={item.isActionable ? "Action Required" : item.status}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    borderRadius: 1,
                    textTransform: "uppercase",
                    bgcolor: item.isActionable
                      ? alpha(theme.palette.warning.main, 0.1)
                      : alpha(theme.palette.success.main, 0.1),
                    color: item.isActionable ? "warning.dark" : "success.dark",
                  }}
                />
              </Stack>
            </Box>
          );
        })}
      </AppScrollView>
    </>
  );
};
