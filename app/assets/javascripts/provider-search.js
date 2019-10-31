$(() => {
  if ($('#payer-select').length > 0) {
    updateProviderNetworkList({ target: { value: $('#payer-select').val() } });
    updateProviderZip({ target: { value: $('#zip-input').val() } });
    updateProviderCity({ target: { value: $('#city-input').val() } });
    updateProviderSpecialty({ target: { value: $('#specialty-select').val() } });
    updateProviderName({ target: { value: $('#name-input').val() } });
  }
});

const updateProviderNetworkList = function (event) {
  updateProviderSearchParam(event, 'network');

  if(event.target.value === '') {
    $('#network-select').html('');
  } else {
    fetch(`/providers/networks.json?payer_id=${event.target.value}`)
      .then(response => response.json())
      .then(networks => {
        const htmlString = networks
              .map(network => `<option value="${network.value}">${network.name}</option>`)
              .join('\n');
        $('#network-select').html(htmlString);
        updateProviderNetwork({ target: { value: $('#network-select').val() } });
      });
  }
};

let providerParams = {};
const updateProviderSearchParam = function(event, param) {
  providerParams[param] = event.target.value;
};

const updateProviderNetwork = function (event) {
  updateProviderSearchParam(event, 'network');
};

const updateProviderZip = function (event) {
  updateProviderSearchParam(event, 'zip');
};

const updateProviderCity= function (event) {
  updateProviderSearchParam(event, 'city');
};

const updateProviderSpecialty = function (event) {
  updateProviderSearchParam(event, 'specialty');
};

const updateProviderName = function (event) {
  updateProviderSearchParam(event, 'name');
};

const submitProviderSearch = function (_event) {
  const params = Object.entries(providerParams)
        .filter(([key, value]) => value && value.length > 0)
        .map(([key, value]) => `${key}=${value}`)
        .join(`&`);

  console.log(params);

  fetchProviders(params);
};

const fetchProviders = function (params) {
  fetch(`/providers/search.json?${params}`)
    .then(response => response.json())
    .then(response => {
      const { providers, nextPage, previousPage } = response;
      updateProviders(providers);
      updateProviderNavigationButtons(nextPage, previousPage);
    });
};

const updateProviders = function (providers) {
  const rows = providerRows(providers);
  $('#providers-table').html(rows);
};

const updateProviderNavigationButtons = function (nextPage, previousPage) {
  const hasNextPage = nextPage !== 'disabled';
  const hasPreviousPage = previousPage !== 'disabled';

  if (hasNextPage) {
    $('#next-button').removeClass('disabled');
  } else {
    $('#next-button').addClass('disabled');
  }
  if (hasPreviousPage) {
    $('#previous-button').removeClass('disabled');
  } else {
    $('#previous-button').addClass('disabled');
  }
  updateProviderNavigationActions(hasNextPage, hasPreviousPage);
};

const updateProviderNavigationActions = function (hasNextPage, hasPreviousPage) {
  $('#next-button').off('click');
  $('#previous-button').off('click');
  if (hasNextPage) {
    $('#next-button').on('click', () => fetchProviders('page=next'));
  }
  if (hasPreviousPage) {
    $('#previous-button').on('click', () => fetchProviders('page=previous'));
  }
};

const providerHeaderRow = `
<tr>
  <th>Name</th>
  <th>Phone/Fax</th>
  <th>Address</th>
  <th>Specialties</th>
</tr>
`;

const providerImageUrl = function (provider) {
  return provider.gender === 'male' ? '/assets/man-user.svg' : '/assets/woman.svg';
};

const providerRows = function (providers) {
  if (providers.length > 0) {
    return providerHeaderRow + providers.map(provider => {
      return `
          <tr>
            <td>
              <a href="/practitioners/${provider.id}">
                <img class="list-photo" src="${providerImageUrl(provider)}">
                <br>
                ${provider.name}
              </a>
            </td>
            <td>${provider.telecom.join('<br>')}</td>
            <td>${provider.address[0]}</td>
            <td>${provider.specialty.join('<br>')}</td>
          </tr>
        `;
    }).join('');
  } else {
    return `
      <tr>
        <th>No providers found</th>
      </tr>
    `;
  }
};
