


export const PaginatorComp = ({ page, setPage, totalPages }: { page: number, setPage: any, totalPages: number }) => {
    const pages: number[] = [];

    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    return (
        <div className="flex justify-center mt-6">
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div>
                    {page > 1 && (
                        <button
                            onClick={() => setPage(page - 1)}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Previous
                        </button>
                    )}
                </div>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm">
                {pages.map((pageNumber: number) => (
                    <button
                        key={pageNumber}
                        onClick={() => setPage(pageNumber)}
                        className={`${pageNumber === page ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-500'} px-2 py-1 rounded-lg`}
                    >
                        {pageNumber}
                    </button>
                ))}
            </div>
            <div>
                {page < totalPages && (
                    <button
                        onClick={() => setPage(page + 1)}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Next
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    )
}