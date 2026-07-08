"use client";

import { formatDate, isValidDate } from "@/utils/format-date";
import { useEffect, useState } from "react";

interface SelectFieldProps {
  relatedTable: string;
  selectKey: string;
  selectName: string;
  value: string;
  onChange: (value: string) => void;
  filters?: {
    filterColumn: string;
    filterValue: string | boolean;
  }[];
}

const SelectField: React.FC<SelectFieldProps> = ({
  relatedTable,
  selectKey,
  selectName,
  value,
  onChange,
  filters,
}) => {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      // Properly stringify filters for URL parameters
      const filtersParam =
        filters && filters.length > 0
          ? `&filters=${encodeURIComponent(JSON.stringify(filters))}`
          : "";

      const response = await fetch(
        `/api/fetch-table-data?relatedTable=${relatedTable}${filtersParam}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const responseData = await response.json();
      setOptions(responseData.data || []);
    };

    fetchOptions();
  }, [relatedTable, filters]);

  return (
    <select
      className="w-[100%] lg:w-[15%] border rounded p-2"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="" disabled>
        Select an option
      </option>
      {options.length > 0 ? (
        options.map((option, index) => {
          const displayValue =
            typeof option[selectName] === "string" &&
            isValidDate(option[selectName])
              ? formatDate(option[selectName])
              : option[selectName];

          return (
            <option key={index} value={option[selectKey]}>
              {displayValue}
            </option>
          );
        })
      ) : (
        <option value="" disabled>
          No data available
        </option>
      )}
    </select>
  );
};

export default SelectField;
