"use client"
import {
  ShadcnTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/shadcn-table";
import React, { useState } from "react";

interface TableProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  list: any[];
}

const Table: React.FC<TableProps> = ({ list }) => {
  const keys = Object.keys(list[0]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredList = list.filter((item) =>
    keys.some((key) =>
      item[key]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 p-2 border border-gray-300 rounded w-72"
      />
      <ShadcnTable>
        <TableHeader>
          <TableRow>
            {keys.map((key, index) => (
              <TableHead key={index}>{key}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredList.map((item, index) => (
            <TableRow key={index}>
              {keys.map((key, idx) => (
                <TableCell key={idx}>{item[key]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </ShadcnTable>
    </div>
  );
};

export default Table;