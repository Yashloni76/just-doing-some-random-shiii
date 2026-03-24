import { Database } from '@/types/database.types'
import { Edit2, Trash2, PackageSearch } from 'lucide-react'

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']

export default function InventoryTable({
  items,
  onEdit,
  onDelete
}: {
  items: InventoryItem[]
  onEdit: (item: InventoryItem) => void
  onDelete: (id: string) => void
}) {
  if (items.length === 0) {
    return (
      <div className="p-16 flex flex-col items-center justify-center text-center text-gray-500 bg-white">
        <PackageSearch size={48} className="text-gray-300 mb-4" />
        <p className="text-xl font-semibold text-gray-800">No items found</p>
        <p className="mt-2 text-gray-500 max-w-sm">There are no items in this category yet. Get started by adding a new inventory item.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
            <th className="px-6 py-4 font-semibold">Name</th>
            <th className="px-6 py-4 font-semibold">Category</th>
            <th className="px-6 py-4 font-semibold text-right">Quantity</th>
            <th className="px-6 py-4 font-semibold text-right">Price/Day</th>
            <th className="px-6 py-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-gray-700">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
              <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                  {item.category}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <span className="font-medium">{item.total_quantity}</span>
              </td>
              <td className="px-6 py-4 text-right">
                <span className="font-semibold text-gray-900 flex items-center justify-end gap-1">
                  <span className="text-gray-400 font-normal">₹</span>{item.price_per_day}
                </span>
              </td>
              <td className="px-6 py-4 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEdit(item)}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
