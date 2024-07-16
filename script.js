document.addEventListener('DOMContentLoaded', function () {
    const assetForm = document.getElementById('assetForm');
    const vendorForm = document.getElementById('vendorForm');
    const assetTableBody = document.querySelector('#assetTable tbody');
    const vendorTableBody = document.querySelector('#vendorTable tbody');
    const exportPdfButton = document.getElementById('exportPdf');
    const exportExcelButton = document.getElementById('exportExcel');
    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');
    const assetChart = document.getElementById('assetChart');
    const addVendorButton = document.getElementById('addVendorButton');
    const vendorListSection = document.getElementById('vendorList');
    const addVendorSection = document.getElementById('addVendor');

    const assets = JSON.parse(localStorage.getItem('assets')) || [];
    const vendors = JSON.parse(localStorage.getItem('vendors')) || [];
    const assetsPerPage = 5;
    let currentPage = 1;

    function updateLocalStorage() {
        localStorage.setItem('assets', JSON.stringify(assets));
        localStorage.setItem('vendors', JSON.stringify(vendors));
    }

    function updateAssetTable() {
        assetTableBody.innerHTML = '';

        const startIndex = (currentPage - 1) * assetsPerPage;
        const endIndex = startIndex + assetsPerPage;
        const paginatedAssets = assets.slice(startIndex, endIndex);

        paginatedAssets.forEach(asset => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${asset.id}</td>
                <td>${asset.holderName}</td>
                <td>${asset.type}</td>
                <td>${asset.status}</td>
                <td>${asset.hostname}</td>
                <td>${asset.productBrand}</td>
                <td>${asset.modelNumber}</td>
                <td>${asset.serialNumber}</td>
                <td>${asset.purchaseDate}</td>
                <td>${asset.configuration}</td>
                <td>${asset.warranty}</td>
                <td>${asset.vendor}</td>
            `;
            assetTableBody.appendChild(row);
        });
    }

    function updateVendorTable() {
        vendorTableBody.innerHTML = '';

        vendors.forEach((vendor, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${vendor.name}</td>
                <td>${vendor.contact}</td>
                <td>${vendor.email}</td>
                <td>${vendor.address}</td>
            `;
            vendorTableBody.appendChild(row);
        });
    }

    function updateChart() {
        const ctx = assetChart.getContext('2d');
        const assetTypes = assets.map(asset => asset.type);
        const uniqueTypes = [...new Set(assetTypes)];
        const typeCounts = uniqueTypes.map(type => assetTypes.filter(assetType => assetType === type).length);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: uniqueTypes,
                datasets: [{
                    label: '# of Assets',
                    data: typeCounts,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    assetForm?.addEventListener('submit', function (event) {
        event.preventDefault();

        const assetHolderName = document.getElementById('assetHolderName').value;
        const assetType = document.getElementById('assetType').value;
        const assetStatus = document.getElementById('assetStatus').value;
        const hostname = document.getElementById('hostname').value;
        const productBrand = document.getElementById('productBrand').value;
        const modelNumber = document.getElementById('modelNumber').value;
        const serialNumber = document.getElementById('serialNumber').value;
        const purchaseDate = document.getElementById('purchaseDate').value;
        const os = document.getElementById('os').value;
        const ram = document.getElementById('ram').value;
        const storage = document.getElementById('storage').value;
        const processor = document.getElementById('processor').value;
        const warranty = document.getElementById('warranty').value;
        const vendor = document.getElementById('vendor').value;

        const asset = {
            id: assets.length + 1,
            holderName: assetHolderName,
            type: assetType,
            status: assetStatus,
            hostname: hostname,
            productBrand: productBrand,
            modelNumber: modelNumber,
            serialNumber: serialNumber,
            purchaseDate: purchaseDate,
            configuration: `OS: ${os}, RAM: ${ram}, Storage: ${storage}, Processor: ${processor}`,
            warranty: warranty,
            vendor: vendor,
        };

        assets.push(asset);
        updateLocalStorage();
        updateAssetTable();
        assetForm.reset();
    });

    vendorForm?.addEventListener('submit', function (event) {
        event.preventDefault();

        const vendorName = document.getElementById('vendorName').value;
        const vendorContact = document.getElementById('vendorContact').value;
        const vendorEmail = document.getElementById('vendorEmail').value;
        const vendorAddress = document.getElementById('vendorAddress').value;

        const vendor = {
            name: vendorName,
            contact: vendorContact,
            email: vendorEmail,
            address: vendorAddress
        };

        vendors.push(vendor);
        updateLocalStorage();
        updateVendorTable();
        vendorForm.reset();
    });

    addVendorButton?.addEventListener('click', function () {
        vendorListSection.style.display = 'none';
        addVendorSection.style.display = 'block';
    });

    prevPageButton?.addEventListener('click', function () {
        if (currentPage > 1) {
            currentPage--;
            updateAssetTable();
        }
    });

    nextPageButton?.addEventListener('click', function () {
        if (currentPage * assetsPerPage < assets.length) {
            currentPage++;
            updateAssetTable();
        }
    });

    exportPdfButton?.addEventListener('click', function () {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.text("Assets List", 14, 16);
        doc.autoTable({
            startY: 20,
            head: [['ID', 'Holder Name', 'Type', 'Status', 'Hostname', 'Product Brand', 'Model Number', 'Serial Number', 'Purchase Date', 'Configuration', 'Warranty', 'Vendor']],
            body: assets.map(asset => [
                asset.id,
                asset.holderName,
                asset.type,
                asset.status,
                asset.hostname,
                asset.productBrand,
                asset.modelNumber,
                asset.serialNumber,
                asset.purchaseDate,
                asset.configuration,
                asset.warranty,
                asset.vendor
            ]),
            theme: 'grid',
            styles: {
                fillColor: [173, 216, 230],
                textColor: [0, 0, 0],
                fontSize: 10
            }
        });

        doc.save('assets.pdf');
    });

    exportExcelButton?.addEventListener('click', function () {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(assets.map(asset => ({
            ID: asset.id,
            HolderName: asset.holderName,
            Type: asset.type,
            Status: asset.status,
            Hostname: asset.hostname,
            ProductBrand: asset.productBrand,
            ModelNumber: asset.modelNumber,
            SerialNumber: asset.serialNumber,
            PurchaseDate: asset.purchaseDate,
            Configuration: asset.configuration,
            Warranty: asset.warranty,
            Vendor: asset.vendor
        })));

        XLSX.utils.book_append_sheet(wb, ws, 'Assets');
        XLSX.writeFile(wb, 'assets.xlsx');
    });

    // Initialize table and chart on page load
    if (assetTableBody) {
        updateAssetTable();
    }

    if (vendorTableBody) {
        updateVendorTable();
    }

    if (assetChart) {
        updateChart();
    }
});
