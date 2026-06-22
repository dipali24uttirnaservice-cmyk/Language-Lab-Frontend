import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import ActionIcon from "../atoms/ActionIcon";

export default function TableActions({
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="flex items-center justify-center gap-3">
      
    <ActionIcon
  icon={Eye}
  gradient="from-blue-500 to-indigo-600"
/>

<ActionIcon
  icon={Pencil}
  gradient="from-amber-400 to-orange-500"
/>



<ActionIcon
  icon={Trash2}
  gradient="from-blue-500 to-indigo-600"
/>

    </div>
  );
}