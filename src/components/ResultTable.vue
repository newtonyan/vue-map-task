<script setup lang="ts">
import {
  useVueTable,
  FlexRender,
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/vue-table";
import { MapLocation } from "../types";
import { ref } from "vue";

const props = defineProps<{
  data: Array<MapLocation>;
}>();

const emit = defineEmits(["delete"]);

const INITIAL_PAGE_INDEX = 0;
const goToPageNumber = ref(INITIAL_PAGE_INDEX + 1);
const pageSizes = [5, 10, 20, 30, 40, 50];

function handleGoToPage(e) {
  const page = e.target.value ? Number(e.target.value) - 1 : 0;
  goToPageNumber.value = page + 1;
  table.setPageIndex(page);
}

function handlePageSizeChange(e) {
  table.setPageSize(Number(e.target.value));
}

const columnHelper = createColumnHelper<MapLocation>();

const columns = [
  columnHelper.accessor("id", {
    cell: (info) => info.getValue(),
    footer: (props) => props.column.id,
  }),
  columnHelper.accessor("name", {
    cell: (info) => info.getValue(),
    footer: (props) => props.column.id,
  }),
  columnHelper.accessor((row) => row.position.lat, {
    id: "latitude",
    cell: (info) => info.getValue(),
    header: () => "Latitude",
    footer: (props) => props.column.id,
  }),
  columnHelper.accessor((row) => row.position.lng, {
    id: "longitude",
    cell: (info) => info.getValue(),
    header: () => "Longitude",
    footer: (props) => props.column.id,
  }),
];

const table = useVueTable({
  get data() {
    return props.data;
  },
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
});

const deleteRow = () => {
  console.log(table.getSelectedRowModel().rows);
  emit(
    "delete",
    table.getSelectedRowModel().rows.map((row) => row.original.id),
    table.resetRowSelection
  );
};
</script>

<template>
  <button @click="deleteRow">delete</button>
  <table>
    <thead>
      <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
        <th></th>
        <th v-for="header in headerGroup.headers" :key="header.id" :colSpan="header.colSpan">
          <FlexRender
            v-if="!header.isPlaceholder"
            :render="header.column.columnDef.header"
            :props="header.getContext()"
          />
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in table.getRowModel().rows" :key="row.id">
        <td>
          <input
            :key="row.original.id"
            type="checkbox"
            :checked="row.getIsSelected()"
            @change="(event) => row.toggleSelected((event.target as HTMLInputElement).checked)"
          />
        </td>
        <td v-for="cell in row.getVisibleCells()" :key="cell.id">
          <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
        </td>
      </tr>
    </tbody>
  </table>
  <div>
    <div class="flex items-center gap-2">
      <button class="border rounded p-1" @click="() => table.setPageIndex(0)" :disabled="!table.getCanPreviousPage()">
        «
      </button>
      <button class="border rounded p-1" @click="() => table.previousPage()" :disabled="!table.getCanPreviousPage()">
        ‹
      </button>
      <button class="border rounded p-1" @click="() => table.nextPage()" :disabled="!table.getCanNextPage()">›</button>
      <button
        class="border rounded p-1"
        @click="() => table.setPageIndex(table.getPageCount() - 1)"
        :disabled="!table.getCanNextPage()"
      >
        »
      </button>
      <span class="flex items-center gap-1">
        <div>Page</div>
        <strong>
          {{ table.getState().pagination.pageIndex + 1 }} of
          {{ table.getPageCount() }}
        </strong>
      </span>
      <span class="flex items-center gap-1">
        | Go to page:
        <input type="number" :value="goToPageNumber" @change="handleGoToPage" class="border p-1 rounded w-16" />
      </span>
      <select :value="table.getState().pagination.pageSize" @change="handlePageSizeChange">
        <option :key="pageSize" :value="pageSize" v-for="pageSize in pageSizes">Show {{ pageSize }}</option>
      </select>
    </div>
    <div>{{ table.getRowModel().rows.length }} Rows</div>
  </div>
</template>
