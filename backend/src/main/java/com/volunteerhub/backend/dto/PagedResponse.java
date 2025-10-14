package com.volunteerhub.backend.dto;

import java.util.List;

public class PagedResponse<T> {
    private List<T> data;
    private int page;
    private int limit;
    private long total;
    private int totalPages;
    private boolean hasNext;
    private boolean hasPrev;

    public PagedResponse() {}

    public PagedResponse(List<T> data, int page, int limit, long total, int totalPages, boolean hasNext, boolean hasPrev) {
        this.data = data; this.page = page; this.limit = limit; this.total = total; this.totalPages = totalPages; this.hasNext = hasNext; this.hasPrev = hasPrev;
    }

    // getters
    public List<T> getData() { return data; }
    public int getPage() { return page; }
    public int getLimit() { return limit; }
    public long getTotal() { return total; }
    public int getTotalPages() { return totalPages; }
    public boolean isHasNext() { return hasNext; }
    public boolean isHasPrev() { return hasPrev; }
}
