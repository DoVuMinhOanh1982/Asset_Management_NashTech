import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Table } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';

import './TableAsset.scss';

import Pagination from '../Pagination/Pagination';
import ModalAssetDetail from './ModalAssetDetail';
import ModalAssetConfirmation from './ModalAssetConfirmation';
import ModalAssetNotification from './ModalAssetNotification';
import { DeleteIcon, EditIcon } from '../../assets/CustomIcon';
import { getAssetDetailAndItsHistories, getCheckAssetIsValidForDeleteOrNot } from '../../services/getApiService';
import { adminRoute } from '../../routes/routes';

const TableAsset = ({
  listAssets = [],
  currentPage = 1,
  totalRow = 1,
  pageSize = 20,
  handleChangeCurrentPage,
  searchKeywords,
  statuses,
  categories,
  fetchListAssets,
}) => {
  const TableAssetColumns = [
    {
      title: (
        <span>
          Asset Code <CaretDownOutlined />
        </span>
      ),
      dataIndex: 'assetCode',
      key: 'assetCode',
      ellipsis: true,
      render: (text, record) => {
        return (
          <div className="col-btn" onClick={() => handleClickRecord(record.assetId)}>
            {text}
          </div>
        );
      },
      sorter: (a, b) => a.assetCode.localeCompare(b.assetCode),
      sortDirections: ['ascend', 'descend', 'ascend'],
    },
    {
      title: (
        <span>
          Asset Name <CaretDownOutlined />
        </span>
      ),
      dataIndex: 'assetName',
      key: 'assetName',
      ellipsis: true,
      render: (text, record) => {
        return (
          <div className="col-btn" onClick={() => handleClickRecord(record.assetId)}>
            {text}
          </div>
        );
      },
      sorter: (a, b) => a.assetName.localeCompare(b.assetName),
      sortDirections: ['ascend', 'descend', 'ascend'],
    },
    {
      title: (
        <span>
          Category <CaretDownOutlined />
        </span>
      ),
      dataIndex: 'category',
      key: 'category',
      ellipsis: true,
      render: (text, record) => {
        return (
          <div className="col-btn" onClick={() => handleClickRecord(record.assetId)}>
            {text}
          </div>
        );
      },
      sorter: (a, b) => a.category.localeCompare(b.category),
      sortDirections: ['ascend', 'descend', 'ascend'],
    },
    {
      title: (
        <span>
          State <CaretDownOutlined />
        </span>
      ),
      key: 'state',
      dataIndex: 'state',
      ellipsis: true,
      render: (text, record) => {
        return (
          <div className="col-btn" onClick={() => handleClickRecord(record.assetId)}>
            {text}
          </div>
        );
      },
      sorter: (a, b) => a.state.localeCompare(b.state),
      sortDirections: ['ascend', 'descend', 'ascend'],
    },
    {
      key: 'action',
      width: '60px',
      render: (text, record) => {
        return (
          <div className="col-action in-active">
            <Link
              to={
                record.state === 'Assigned'
                  ? '#'
                  : `/${adminRoute.home}/${adminRoute.manageAsset}/${adminRoute.editAsset}/${record.assetId}`
              }
            >
              <button className="edit-btn" disabled={record.state === 'Assigned'}>
                <EditIcon />
              </button>
            </Link>

            <button
              className="delete-btn"
              disabled={record.state === 'Assigned'}
              onClick={() => handleCheckDeleteAsset(record.assetId)}
            >
              <DeleteIcon />
            </button>
          </div>
        );
      },
    },
  ];

  const [isShowModalAssetDetail, setIsShowModalAssetDetail] = useState(false);
  const [modalData, setModalData] = useState({});
  const [listHistory, setListHistory] = useState([]);
  const [isShowModalConfirmation, setIsShowModalConfirmation] = useState(false);
  const [currentAssetId, setCurrentAssetId] = useState(0);
  const [isShowModalNotification, setIsShowModalNotification] = useState(false);

  const handleCheckDeleteAsset = async (assetId) => {
    setCurrentAssetId(assetId);
    const response = await getCheckAssetIsValidForDeleteOrNot(assetId);
    if (response && response.status === 204) {
      setIsShowModalConfirmation(true);
    }
    if (response && response.response && response.response.status === 400) {
      setIsShowModalNotification(true);
    }
  };

  const handleClickRecord = async (assetId) => {
    const response = await getAssetDetailAndItsHistories(assetId);
    if (response && response.status === 200) {
      setModalData(response?.data.asset);
      setListHistory(
        response?.data?.histories.length === 0
          ? []
          : response?.data?.histories.map((item, index) => {
              return {
                key: index,
                date: convertStrDate(item.assignedDate),
                assignedTo: item.assignedTo,
                assignedBy: item.assignedBy,
                returnedDate: convertStrDate(item.returnedDate),
              };
            }),
      );

      setIsShowModalAssetDetail(true);
    }
  };

  const handleChangePage = (current) => {
    handleChangeCurrentPage(current);
  };

  const convertStrDate = (dateStr) => {
    const date = new Date(dateStr);
    return (
      (date.getDate() > 9 ? date.getDate() : '0' + date.getDate()) +
      '/' +
      (date.getMonth() > 8 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1)) +
      '/' +
      date.getFullYear()
    );
  };

  return (
    <>
      <Table
        id="table-asset"
        className="table-asset"
        showSorterTooltip={false}
        rowSelection={false}
        columns={TableAssetColumns}
        dataSource={listAssets}
        pagination={false}
      />
      <Pagination onChange={handleChangePage} current={currentPage} defaultPageSize={pageSize} total={totalRow} />
      <ModalAssetDetail
        open={isShowModalAssetDetail}
        onCancel={() => {
          setIsShowModalAssetDetail(false);
          setModalData({});
          setListHistory([]);
        }}
        data={modalData}
        listHistories={listHistory}
      />
      <ModalAssetConfirmation
        open={isShowModalConfirmation}
        onCancel={() => {
          setIsShowModalConfirmation(false);
          setCurrentAssetId(0);
        }}
        data={currentAssetId}
        searchKeywords={searchKeywords}
        statuses={statuses}
        categories={categories}
        fetchListAssets={fetchListAssets}
        pageSize={pageSize}
        handleChangePage={handleChangeCurrentPage}
      />
      <ModalAssetNotification
        open={isShowModalNotification}
        onCancel={() => {
          setIsShowModalNotification(false);
          setCurrentAssetId(0);
        }}
        data={currentAssetId}
      />
    </>
  );
};

export default TableAsset;
