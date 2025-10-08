'use client'

import { useState } from "react"
import Link from "next/link"

export default function BillingPage() {
  // Mock billing data (more records for pagination demo)
  const mockBilling = [
    { id: 1, date: "2025-09-01", amount: "₦20,000", status: "Paid", method: "Card" },
    { id: 2, date: "2025-08-01", amount: "₦20,000", status: "Paid", method: "Bank Transfer" },
    { id: 3, date: "2025-07-01", amount: "₦20,000", status: "Failed", method: "Card" },
    { id: 4, date: "2025-06-01", amount: "₦20,000", status: "Paid", method: "Card" },
    { id: 5, date: "2025-05-01", amount: "₦20,000", status: "Paid", method: "Card" },
    { id: 6, date: "2025-04-01", amount: "₦20,000", status: "Failed", method: "Bank Transfer" },
    { id: 7, date: "2025-03-01", amount: "₦20,000", status: "Paid", method: "Card" },
    { id: 8, date: "2025-02-01", amount: "₦20,000", status: "Paid", method: "Card" },
    { id: 9, date: "2025-01-01", amount: "₦20,000", status: "Paid", method: "Bank Transfer" },
    { id: 10, date: "2024-12-01", amount: "₦20,000", status: "Failed", method: "Card" },
  ]

  const [filter, setFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const itemsPerPage = 5

  // Apply filters + search
  const filteredBilling = mockBilling.filter((bill) => {
    const matchesStatus = filter === "All" || bill.status === filter
    const matchesSearch =
      bill.date.toLowerCase().includes(search.toLowerCase()) ||
      bill.amount.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredBilling.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentData = filteredBilling.slice(startIndex, startIndex + itemsPerPage)

  // Mock invoice download
  const handleDownloadInvoice = (id: number) => {
    alert(`Downloading invoice for transaction ID: ${id}`)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Billing History</h1>
      <p className="mb-6">Here you can view your payment and billing history.</p>

      {/* Filters + Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-3 md:space-y-0">
        {/* Filter buttons */}
        <div className="flex space-x-2">
          {["All", "Paid", "Failed"].map((status) => (
            <button
              key={status}
              onClick={() => {
                setFilter(status)
                setCurrentPage(1) // reset to page 1 when filter changes
              }}
              className={`px-4 py-2 rounded-lg border font-medium transition-colors 
                ${filter === status 
                  ? "bg-emerald-900 text-white border-emerald-900" 
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search box */}
        <div className="mt-2 md:mt-0">
          <input
            type="text"
            placeholder="Search by date or amount..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1) // reset to page 1 when searching
            }}
            className="px-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow rounded-lg border border-gray-200 mb-6">
        <table className="w-full border-collapse text-left">
          <thead className="bg-emerald-900 text-white">
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Payment Method</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((bill) => (
                <tr key={bill.id} className="border-b last:border-none">
                  <td className="px-4 py-2">{bill.date}</td>
                  <td className="px-4 py-2">{bill.amount}</td>
                  <td
                    className={`px-4 py-2 font-semibold ${
                      bill.status === "Paid"
                        ? "text-emerald-700"
                        : "text-red-600"
                    }`}
                  >
                    {bill.status}
                  </td>
                  <td className="px-4 py-2">{bill.method}</td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleDownloadInvoice(bill.id)}
                      className="px-3 py-1 rounded bg-emerald-900 text-white text-sm hover:bg-emerald-800"
                    >
                      Download Invoice
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className={`px-4 py-2 rounded-lg border ${
              currentPage === 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-white hover:bg-gray-50 border-gray-300 text-gray-700"
            }`}
          >
            Previous
          </button>

          {/* Page numbers */}
          <div className="flex space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded ${
                  currentPage === page
                    ? "bg-emerald-900 text-white"
                    : "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className={`px-4 py-2 rounded-lg border ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-white hover:bg-gray-50 border-gray-300 text-gray-700"
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* Back button */}
      <div className="mt-6">
        <Link 
          href="/admin/dashboard" 
          className="px-4 py-2 rounded bg-emerald-900 text-white hover:bg-emerald-800"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
