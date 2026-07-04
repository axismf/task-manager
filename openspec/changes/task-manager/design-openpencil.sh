#!/usr/bin/env bash
# Task Manager UI — OpenPencil design script
# Uses op insert --parent (most reliable approach per SKILL.md)
set -e

ID() { python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('nodeId', d.get('id','')))" ; }

echo "Building Task Manager UI in OpenPencil..."

# ── Root frame (mobile-sized app shell) ──────────────────────────────────────
ROOT=$(op insert '{
  "type": "frame",
  "name": "Task Manager",
  "width": 480,
  "height": 700,
  "layout": "vertical",
  "padding": [32, 32],
  "gap": 20,
  "fill": [{"type": "solid", "color": "#F9FAFB"}],
  "cornerRadius": 12,
  "effects": [{"type": "shadow", "offsetY": 4, "blur": 12, "color": "rgba(0,0,0,0.08)"}]
}' | ID)
echo "Root: $ROOT"

# ── Header ───────────────────────────────────────────────────────────────────
op insert --parent "$ROOT" '{
  "type": "text",
  "name": "App Title",
  "content": "Task Manager",
  "fontSize": 28,
  "fontWeight": 700,
  "fontFamily": "Space Grotesk",
  "letterSpacing": -0.5,
  "fill": [{"type": "solid", "color": "#111111"}]
}'

# ── TaskInput section ─────────────────────────────────────────────────────────
INPUT_ROW=$(op insert --parent "$ROOT" '{
  "type": "frame",
  "name": "TaskInput",
  "width": "fill_container",
  "height": "fit_content",
  "layout": "horizontal",
  "gap": 8
}' | ID)

op insert --parent "$INPUT_ROW" '{
  "type": "rectangle",
  "name": "TextInput",
  "role": "form-input",
  "width": "fill_container",
  "height": 48,
  "cornerRadius": 8,
  "layout": "horizontal",
  "padding": [0, 14],
  "alignItems": "center",
  "fill": [{"type": "solid", "color": "#FFFFFF"}],
  "stroke": {"thickness": 1, "fill": [{"type": "solid", "color": "#D1D5DB"}]}
}'

ADD_BTN=$(op insert --parent "$INPUT_ROW" '{
  "type": "rectangle",
  "name": "AddButton",
  "role": "button",
  "width": 72,
  "height": 48,
  "cornerRadius": 8,
  "layout": "horizontal",
  "justifyContent": "center",
  "alignItems": "center",
  "fill": [{"type": "solid", "color": "#4F46E5"}]
}' | ID)
op insert --parent "$ADD_BTN" '{
  "type": "text",
  "content": "Add",
  "fontSize": 15,
  "fontWeight": 600,
  "fill": [{"type": "solid", "color": "#FFFFFF"}]
}'

# ── FilterBar ─────────────────────────────────────────────────────────────────
FILTER_BAR=$(op insert --parent "$ROOT" '{
  "type": "frame",
  "name": "FilterBar",
  "width": "fill_container",
  "height": "fit_content",
  "layout": "horizontal",
  "gap": 6,
  "padding": [4, 4],
  "cornerRadius": 8,
  "fill": [{"type": "solid", "color": "#E5E7EB"}]
}' | ID)

# Active filter (All)
ALL_BTN=$(op insert --parent "$FILTER_BAR" '{
  "type": "rectangle",
  "name": "FilterAll (active)",
  "width": "fill_container",
  "height": 36,
  "cornerRadius": 6,
  "layout": "horizontal",
  "justifyContent": "center",
  "alignItems": "center",
  "fill": [{"type": "solid", "color": "#4F46E5"}]
}' | ID)
op insert --parent "$ALL_BTN" '{
  "type": "text",
  "content": "All",
  "fontSize": 13,
  "fontWeight": 600,
  "fill": [{"type": "solid", "color": "#FFFFFF"}]
}'

# Inactive: Active
ACT_BTN=$(op insert --parent "$FILTER_BAR" '{
  "type": "rectangle",
  "name": "FilterActive",
  "width": "fill_container",
  "height": 36,
  "cornerRadius": 6,
  "layout": "horizontal",
  "justifyContent": "center",
  "alignItems": "center",
  "fill": [{"type": "solid", "color": "#FFFFFF"}]
}' | ID)
op insert --parent "$ACT_BTN" '{
  "type": "text",
  "content": "Active",
  "fontSize": 13,
  "fill": [{"type": "solid", "color": "#6B7280"}]
}'

# Inactive: Completed
COMP_BTN=$(op insert --parent "$FILTER_BAR" '{
  "type": "rectangle",
  "name": "FilterCompleted",
  "width": "fill_container",
  "height": 36,
  "cornerRadius": 6,
  "layout": "horizontal",
  "justifyContent": "center",
  "alignItems": "center",
  "fill": [{"type": "solid", "color": "#FFFFFF"}]
}' | ID)
op insert --parent "$COMP_BTN" '{
  "type": "text",
  "content": "Completed",
  "fontSize": 13,
  "fill": [{"type": "solid", "color": "#6B7280"}]
}'

# ── TaskList ──────────────────────────────────────────────────────────────────
TASK_LIST=$(op insert --parent "$ROOT" '{
  "type": "frame",
  "name": "TaskList",
  "width": "fill_container",
  "height": "fit_content",
  "layout": "vertical",
  "gap": 8
}' | ID)

# Task Item 1 (active)
ITEM1=$(op insert --parent "$TASK_LIST" '{
  "type": "frame",
  "name": "TaskItem (active)",
  "width": "fill_container",
  "height": 52,
  "layout": "horizontal",
  "padding": [0, 16],
  "gap": 12,
  "alignItems": "center",
  "cornerRadius": 8,
  "fill": [{"type": "solid", "color": "#FFFFFF"}],
  "stroke": {"thickness": 1, "fill": [{"type": "solid", "color": "#E5E7EB"}]}
}' | ID)
op insert --parent "$ITEM1" '{
  "type": "ellipse",
  "name": "Checkbox (unchecked)",
  "width": 18,
  "height": 18,
  "stroke": {"thickness": 2, "fill": [{"type": "solid", "color": "#D1D5DB"}]}
}'
op insert --parent "$ITEM1" '{
  "type": "text",
  "name": "TaskText",
  "content": "Buy groceries",
  "fontSize": 15,
  "width": "fill_container",
  "fill": [{"type": "solid", "color": "#111111"}]
}'
op insert --parent "$ITEM1" '{
  "type": "icon_font",
  "name": "DeleteBtn",
  "iconFontName": "x",
  "width": 16,
  "height": 16,
  "fill": [{"type": "solid", "color": "#9CA3AF"}]
}'

# Task Item 2 (active)
ITEM2=$(op insert --parent "$TASK_LIST" '{
  "type": "frame",
  "name": "TaskItem (active) 2",
  "width": "fill_container",
  "height": 52,
  "layout": "horizontal",
  "padding": [0, 16],
  "gap": 12,
  "alignItems": "center",
  "cornerRadius": 8,
  "fill": [{"type": "solid", "color": "#FFFFFF"}],
  "stroke": {"thickness": 1, "fill": [{"type": "solid", "color": "#E5E7EB"}]}
}' | ID)
op insert --parent "$ITEM2" '{
  "type": "ellipse",
  "name": "Checkbox (unchecked)",
  "width": 18,
  "height": 18,
  "stroke": {"thickness": 2, "fill": [{"type": "solid", "color": "#D1D5DB"}]}
}'
op insert --parent "$ITEM2" '{
  "type": "text",
  "name": "TaskText",
  "content": "Read SDD docs",
  "fontSize": 15,
  "width": "fill_container",
  "fill": [{"type": "solid", "color": "#111111"}]
}'
op insert --parent "$ITEM2" '{
  "type": "icon_font",
  "name": "DeleteBtn",
  "iconFontName": "x",
  "width": 16,
  "height": 16,
  "fill": [{"type": "solid", "color": "#9CA3AF"}]
}'

# Task Item 3 (completed)
ITEM3=$(op insert --parent "$TASK_LIST" '{
  "type": "frame",
  "name": "TaskItem (completed)",
  "width": "fill_container",
  "height": 52,
  "layout": "horizontal",
  "padding": [0, 16],
  "gap": 12,
  "alignItems": "center",
  "cornerRadius": 8,
  "fill": [{"type": "solid", "color": "#F9FAFB"}],
  "stroke": {"thickness": 1, "fill": [{"type": "solid", "color": "#E5E7EB"}]}
}' | ID)
op insert --parent "$ITEM3" '{
  "type": "ellipse",
  "name": "Checkbox (checked)",
  "width": 18,
  "height": 18,
  "fill": [{"type": "solid", "color": "#4F46E5"}]
}'
op insert --parent "$ITEM3" '{
  "type": "text",
  "name": "TaskText (done)",
  "content": "Setup OpenPencil",
  "fontSize": 15,
  "width": "fill_container",
  "fill": [{"type": "solid", "color": "#9CA3AF"}]
}'
op insert --parent "$ITEM3" '{
  "type": "icon_font",
  "name": "DeleteBtn",
  "iconFontName": "x",
  "width": 16,
  "height": 16,
  "fill": [{"type": "solid", "color": "#D1D5DB"}]
}'

# ── Footer ────────────────────────────────────────────────────────────────────
FOOTER=$(op insert --parent "$ROOT" '{
  "type": "frame",
  "name": "TaskFooter",
  "width": "fill_container",
  "height": "fit_content",
  "layout": "horizontal",
  "justifyContent": "start",
  "alignItems": "center"
}' | ID)
op insert --parent "$FOOTER" '{
  "type": "text",
  "name": "ItemCount",
  "content": "2 items left",
  "fontSize": 13,
  "fill": [{"type": "solid", "color": "#6B7280"}]
}'

# ── Refine (resolve icons, validate layout) ───────────────────────────────────
echo "Running design:refine..."
op design:refine --root-id "$ROOT" --pretty

echo ""
echo "✓ Task Manager UI created in OpenPencil"
echo "  Root node ID: $ROOT"
echo ""
echo "Saving document..."
op save /home/axis/axis/Dev/Web/Testeo-OpenPencil/openspec/changes/task-manager/task-manager.op
echo "✓ Saved to task-manager.op"
