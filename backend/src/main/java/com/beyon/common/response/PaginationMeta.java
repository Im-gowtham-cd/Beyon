package com.beyon.common.response;

public class PaginationMeta {
    private int page;
    private int size;
    private long total;
    private int totalPages;

    public PaginationMeta() {}
    public PaginationMeta(int page, int size, long total, int totalPages) {
        this.page = page;
        this.size = size;
        this.total = total;
        this.totalPages = totalPages;
    }

    public int getPage() { return page; }
    public void setPage(int v) { this.page = v; }
    public int getSize() { return size; }
    public void setSize(int v) { this.size = v; }
    public long getTotal() { return total; }
    public void setTotal(long v) { this.total = v; }
    public int getTotalPages() { return totalPages; }
    public void setTotalPages(int v) { this.totalPages = v; }
}
