<template>
  <CToaster placement="top-end">
    <CToast v-for="toast in toasts" v-bind:key="toast.index">
      <CToastHeader closeButton>
        <span class="me-auto fw-bold">{{ toast.title }}</span>
        <small>7 min ago</small>
      </CToastHeader>
      <CToastBody>
        {{ toast.content }}
      </CToastBody>
    </CToast>
  </CToaster>

  <CModal
    :visible="orderLogVisible"
    @close="
      () => {
        orderLogVisible = false
      }
    "
  >
    <CModalHeader
      dismiss
      @close="
        () => {
          orderLogVisible = false
        }
      "
    >
      <CModalTitle>ثبت گزارش خروج</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CForm @submit="createNewOrderLog">
        <div class="mb-3">
          <CFormLabel for="newOrderLogGivenBy">تحویل‌دهنده</CFormLabel>
          <CFormInput
            id="newOrderLogGivenBy"
            placeholder=""
            v-model="orderLogForm.given_by"
          />
        </div>
        <div class="mb-3">
          <CFormLabel for="newOrderLogReceivedBy">تحویل‌گیرنده</CFormLabel>
          <CFormInput
            id="newOrderLogReceivedBy"
            placeholder=""
            v-model="orderLogForm.received_by"
          />
        </div>
        <div class="mb-3">
          <CFormLabel for="newOrderLogReason">علت</CFormLabel>
          <CFormTextarea
            id="NewOrderLogReason"
            rows="3"
            v-model="orderLogForm.reason"
          ></CFormTextarea>
        </div>
        <div>
          <CCol :xs="12">
            <CButton color="primary" type="submit">ثبت</CButton>
          </CCol>
        </div>
      </CForm>
    </CModalBody>
  </CModal>

  <CRow>
    <CCol xs>
      <CFormInput
        v-model="filters.first_name"
        placeholder="نام"
        aria-label="First name"
      />
    </CCol>
    <CCol xs>
      <CFormInput
        v-model="filters.last_name"
        placeholder="نام خانوادگی"
        aria-label="Last name"
      />
    </CCol>
    <CCol xs>
      <CFormInput
        v-model="filters.national_id"
        placeholder="کد ملی"
        aria-label="Last name"
      />
    </CCol>
    <CCol xs>
      <CFormInput
        v-model="filters.recruit_date"
        placeholder="تاریخ اعزام"
        aria-label="Last name"
      />
    </CCol>

    <CCol xs>
      <CButton color="primary" @click="fetchData()">جستجو</CButton>
    </CCol>
  </CRow>

  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader>
          <strong>پرونده‌ها</strong>
        </CCardHeader>
        <CCardBody>
          <CTable striped hover>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell scope="col">شماره پرونده</CTableHeaderCell>
                <CTableHeaderCell scope="col">نام</CTableHeaderCell>
                <CTableHeaderCell scope="col">نام خانوادگی</CTableHeaderCell>
                <CTableHeaderCell scope="col">کد ملی</CTableHeaderCell>
                <CTableHeaderCell scope="col">تاریخ اعزام</CTableHeaderCell>
                <CTableHeaderCell scope="col">وضعیت</CTableHeaderCell>
                <CTableHeaderCell scope="col">اعمال</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow
                v-for="file in files"
                v-bind:key="file.id"
                class="row-item"
              >
                <CTableHeaderCell>{{ file.file_no }}</CTableHeaderCell>
                <CTableDataCell>{{ file.first_name }}</CTableDataCell>
                <CTableDataCell>{{ file.last_name }}</CTableDataCell>
                <CTableDataCell>{{ file.national_id }}</CTableDataCell>
                <CTableDataCell>{{ file.recruit_date }}</CTableDataCell>
                <CTableDataCell>{{ status_map[file.status] }}</CTableDataCell>
                <CTableDataCell>
                  <CDropdown placement="bottom-end">
                    <CDropdownToggle
                      color="transparent"
                      class="p-0 text-white"
                      :caret="false"
                    >
                      <CIcon icon="cil-options" class="text-high-emphasis" />
                    </CDropdownToggle>
                    <CDropdownMenu>
                      <CDropdownItem
                        href="#"
                        v-if="file.status !== 'away'"
                        @click="
                          () => {
                            orderLogVisible = true
                            orderLogForm.file = file.id
                          }
                        "
                        >ثبت گزارش خروج
                      </CDropdownItem>
                    </CDropdownMenu>
                  </CDropdown>
                </CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>

          <CPagination aria-label="Page navigation example">
            <CPaginationItem
              aria-label="Previous"
              @click="previousPage()"
              :active="hasPreviousPage"
              :disabled="!hasPreviousPage"
            >
              <span aria-hidden="true">&laquo;</span>
            </CPaginationItem>
            <CPaginationItem
              >{{ this.page }}/{{ this.num_pages }}</CPaginationItem
            >
            <CPaginationItem
              aria-label="Next"
              @click="nextPage()"
              :active="hasNextPage"
              :disabled="!hasNextPage"
            >
              <span aria-hidden="true">&raquo;</span>
            </CPaginationItem>
          </CPagination>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<script>
import axios from 'axios'
import { Form } from 'vform'
import FilterQuery from '../utils/filter-query'

export default {
  name: 'Files',

  data() {
    return {
      toasts: [],
      files: {},
      filters: {},
      page: 1,
      num_pages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      orderLogVisible: false,
      orderLogForm: new Form({
        file: null,
        given_by: '',
        received_by: '',
        reason: '',
      }),
      status_map: {
        unknown: 'نامعلوم',
        present: 'حاضر',
        archived: 'راکد',
        away: 'خروج',
      },
    }
  },

  watch: {
    $route: 'fetchData',
  },

  mounted() {
    this.fetchData()
  },

  methods: {
    async fetchData() {
      let response = await axios.get(
        `http://localhost:8000/archive/files/?${FilterQuery(
          this.filters,
        )}&page=${this.page}`,
      )

      this.num_pages = response.data.num_pages
      this.hasNextPage = this.page < this.num_pages
      this.hasPreviousPage = this.page > 1
      this.files = response.data.results
    },

    nextPage() {
      if (this.hasNextPage) {
        this.page = this.page + 1
        this.fetchData()
      }
    },

    previousPage() {
      if (this.hasPreviousPage) {
        this.page = this.page - 1
        this.fetchData()
      }
    },

    createNewOrderLog() {
      this.orderLogForm
        .post(`http://localhost:8000/archive/orders/`)
        .catch(() => {
          this.createToast('', 'ثبت با مشکل انجام شد')
        })
        .then(() => {
          this.createToast('', 'ثبت با موفقیت انجام شد')
          this.orderLogVisible = false
          this.orderLogForm.reset()
          this.fetchData()
        })
    },

    createToast(title, content) {
      this.toasts.push({
        title: '',
        content: content,
      })
    },
  },
}
</script>
