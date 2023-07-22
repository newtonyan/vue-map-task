<script setup lang="ts">
import {
  useVueTable,
  FlexRender,
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/vue-table";
import { MapLocation } from "../types";
import { computed, ref } from "vue";
import { updateMap } from "../utils";
import { TrashIcon } from "@heroicons/vue/24/outline";

const props = defineProps<{
  data: Array<MapLocation>;
  map: google.maps.Map;
}>();

const emit = defineEmits(["delete"]);

const columnHelper = createColumnHelper<MapLocation>();

const columns = [
  // columnHelper.accessor("id", {
  //   cell: (info) => info.getValue(),
  //   footer: (props) => props.column.id,
  // }),
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
  // columnHelper.accessor((row) => row.position.lng, {
  //   id: "longitude",
  //   cell: (info) => info.getValue(),
  //   header: () => "Longitude",
  //   footer: (props) => props.column.id,
  // }),
  columnHelper.accessor((row) => row.utc_offset_minutes, {
    id: "utc_offset_minutes",
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
  initialState: {
    pagination: {
      pageSize: 10,
    },
  },
});

const deleteRow = () => {
  console.log(table.getSelectedRowModel().rows);
  emit(
    "delete",
    table.getSelectedRowModel().rows.map((row) => row.original.id),
    table.resetRowSelection
  );
};

const isDataEmpty = computed(() => {
  return table.getCoreRowModel().rows.length <= 0;
});
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <span class="text-lg font-bold leading-10">
        Saved
        <template v-if="!isDataEmpty"
          >({{ table.getCoreRowModel().rows.length }})</template
        >
      </span>
      <button
        class="h-8 rounded-md px-3 hover:bg-gray-200/80"
        @click="deleteRow"
        :disabled="
          !(table.getIsSomeRowsSelected() || table.getIsAllRowsSelected())
        "
      >
        Delete
      </button>
    </div>

    <div v-if="isDataEmpty">You haven't saved any location.</div>

    <ol class="mt-2 flex flex-col gap-2">
      <li
        class="flex items-center gap-2"
        v-for="row in table.getRowModel().rows"
        :key="row.id"
      >
        <label
          :for="`checkbox-${row.original.id}`"
          class="flex flex-1 items-center gap-4 rounded-md border border-gray-300 bg-white p-3 shadow-sm hover:bg-teal-50 [&:has(input:checked)]:border-teal-500 [&:has(input:checked)]:ring-1 [&:has(input:checked)]:ring-teal-500"
          @click="
            updateMap(map, {
              center: row.original.position,
              zoom: 15,
            })
          "
        >
          <input
            :id="`checkbox-${row.original.id}`"
            class="rounded-md text-teal-500 focus:ring-teal-500"
            :key="row.original.id"
            type="checkbox"
            :checked="row.getIsSelected()"
            @change="
              (event) =>
                row.toggleSelected((event.target as HTMLInputElement).checked)
            "
          />
          <div class="text-sm">
            <div
              class="first:font-semibold"
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
            >
              <FlexRender
                :render="cell.column.columnDef.cell"
                :props="cell.getContext()"
              />
            </div>
          </div>
        </label>
      </li>
    </ol>
    <div
      v-if="!isDataEmpty"
      class="mt-4 flex items-center justify-between gap-2"
    >
      <span class="flex items-center gap-1 text-sm font-semibold">
        <div>Page</div>
        {{ table.getState().pagination.pageIndex + 1 }} of
        {{ table.getPageCount() }}
      </span>
      <div class="space-x-2">
        <button
          class="h-9 w-9 border border-gray-300 bg-white"
          @click="() => table.setPageIndex(0)"
          :disabled="!table.getCanPreviousPage()"
        >
          «
        </button>
        <button
          class="h-9 w-9 border border-gray-300 bg-white"
          @click="() => table.previousPage()"
          :disabled="!table.getCanPreviousPage()"
        >
          ‹
        </button>
        <button
          class="h-9 w-9 border border-gray-300 bg-white"
          @click="() => table.nextPage()"
          :disabled="!table.getCanNextPage()"
        >
          ›
        </button>
        <button
          class="h-9 w-9 border border-gray-300 bg-white"
          @click="() => table.setPageIndex(table.getPageCount() - 1)"
          :disabled="!table.getCanNextPage()"
        >
          »
        </button>
      </div>
      <!-- <span class="flex items-center gap-1">
          | Go to page:
          <input type="number" :value="goToPageNumber" @change="handleGoToPage" class="border p-1 rounded w-16" />
        </span> -->
    </div>
    <!-- <div>{{ table.getRowModel().rows.length }} Rows</div> -->
  </div>
</template>
