import { FaTrash } from "react-icons/fa";
import { RxUpdate } from "react-icons/rx";
const Table = ({ headers, rows, actions }) => {
  return (
    <table className="w-full min-w-max table-auto text-left">
      <thead>
        <tr>
          {headers.map((header, index) => (
            <th
              key={index}
              className="border-b border-blue-gray-100 bg-blue-gray-100 px-4 py-2 text-sm font-semibold text-gray-500 whitespace-nowrap"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={row.id || rowIndex} className="hover:bg-blue-gray-100">
            <td className="border-b border-blue-gray-100 p-4 text-sm text-gray-700">
              {rowIndex + 1} {/* S/N */}
            </td>
            <td className="border-b border-blue-gray-100 p-4 text-sm text-gray-700">
              {row.name} {/* Name */}
            </td>
            <td className="border-b border-blue-gray-100 p-4 text-sm text-gray-700">
              {row.email} {/* Email */}
            </td>
            <td className="border-b border-blue-gray-100 p-4 text-sm text-gray-700">
              {row.role} {/* Role */}
            </td>
            <td className="border-b border-blue-gray-100 p-4 text-sm text-gray-700">
              {row.gender} {/* Gender */}
            </td>
            <td className="border-b border-blue-gray-100 p-4 text-sm text-gray-700">
              {row.unitId} {/* Unit ID */}
            </td>
            <td className="border-b border-blue-gray-100 p-4 text-sm text-gray-700 space-x-2">
              {actions && (
                <td>
                  {actions.update && (
                    <RxUpdate
                      className="text-blue-gray-700 cursor-pointer hover:text-blue-gray-600"
                      onClick={() => actions.update(row)}
                    />
                  )}
                </td>
              )}
            </td>
            <td className="border-b border-blue-gray-100 p-4 text-sm text-gray-700 space-x-2">
              {actions && (
                <td>
                  {actions.delete && (
                    <FaTrash
                      className="text-red-500 cursor-pointer hover:text-red-700"
                      onClick={() => actions.delete(row.id)}
                    />
                  )}
                </td>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
