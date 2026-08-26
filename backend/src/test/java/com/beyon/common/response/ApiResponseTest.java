package com.beyon.common.response;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ApiResponseTest {

    @Test
    void okWithData() {
        ApiResponse<String> response = ApiResponse.ok("hello");
        assertTrue(response.isSuccess());
        assertEquals("hello", response.getData());
        assertEquals("Operation successful", response.getMessage());
        assertNull(response.getError());
    }

    @Test
    void okWithMessage() {
        ApiResponse<Integer> response = ApiResponse.ok(42, "Found it");
        assertTrue(response.isSuccess());
        assertEquals(42, response.getData());
        assertEquals("Found it", response.getMessage());
    }

    @Test
    void okWithoutData() {
        ApiResponse<?> response = ApiResponse.ok();
        assertTrue(response.isSuccess());
        assertNull(response.getData());
    }

    @Test
    void errorResponse() {
        ApiResponse<?> response = ApiResponse.error("Something went wrong");
        assertFalse(response.isSuccess());
        assertEquals("Something went wrong", response.getError());
        assertNull(response.getData());
    }

    @Test
    void paginatedResponse() {
        ApiResponse<String> response = ApiResponse.paginated("data", 0, 10, 55);
        assertTrue(response.isSuccess());
        assertEquals("data", response.getData());
        assertNotNull(response.getPagination());
        assertEquals(0, response.getPagination().getPage());
        assertEquals(10, response.getPagination().getSize());
        assertEquals(55, response.getPagination().getTotal());
        assertEquals(6, response.getPagination().getTotalPages());
    }
}
