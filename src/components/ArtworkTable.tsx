

import React, {  useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

const ArtworkTable: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const fetchArtworks = async (page: number, perPage: number) => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page}&limit=${perPage}`);
      const data = await response.json();
      const cleaned = data.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        place_of_origin: item.place_of_origin,
        artist_display: item.artist_display,
        inscriptions: item.inscriptions,
        date_start: item.date_start,
        date_end: item.date_end,
      }));
      setArtworks(cleaned);
      setTotalRecords(data.pagination.total);
    } catch (error) {
      console.error('Error fetching artworks:', error);
    } finally {
      setLoading(false);
    }
  };

  const onPage = (event: any) => {
    setFirst(event.first);
    setRows(event.rows);
    fetchArtworks(event.page + 1, event.rows);
  };

  React.useEffect(() => {
    fetchArtworks(1, rows);
  }, [rows]);

  const addSelectedIds = (ids: number[]) => {
    setSelectedIds((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const removeSelectedIds = (ids: number[]) => {
    setSelectedIds((prev) => prev.filter(id => !ids.includes(id)));
  };

  const onSelectionChange = (e: { value: Artwork[] }) => {
    const currentPageIds = artworks.map(a => a.id);

    removeSelectedIds(currentPageIds);

    const newlySelected = e.value.map(row => row.id);
    addSelectedIds(newlySelected);
  };

  const selectedRows = artworks.filter(a => selectedIds.includes(a.id));

  return (
    <div>
      <DataTable
        value={artworks}
        lazy
        paginator
        first={first}
        rows={rows}
        totalRecords={totalRecords}
        onPage={onPage}
        loading={loading}
        selectionMode="checkbox"
        selection={selectedRows}
        onSelectionChange={onSelectionChange}
        dataKey="id"
        header="Artworks"
      >
        <Column selectionMode="multiple" style={{ width: '3rem' }}/>
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Place of Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Date Start" />
        <Column field="date_end" header="Date End" />
      </DataTable>

      <div style={{ marginTop: '1rem' }}>
        <h3>Selected Artworks (IDs):</h3>
        <ul>
          {selectedIds.map(id => (
            <li key={id}>{id}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ArtworkTable;
