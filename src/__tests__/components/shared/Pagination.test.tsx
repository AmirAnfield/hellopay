import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Pagination from '@/components/shared/Pagination';

describe('Composant Pagination', () => {
  const defaultProps = {
    currentPage: 3,
    totalPages: 10,
    onPageChange: jest.fn(),
    totalItems: 100,
    pageSize: 10,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devrait rendre le composant de pagination avec les bonnes valeurs', () => {
    render(<Pagination {...defaultProps} />);
    
    // Vérifier que les info de pagination sont affichées
    expect(screen.getByText(/21 - 30/)).toBeInTheDocument();
    expect(screen.getByText(/100/)).toBeInTheDocument();
    
    // Vérifier que la page courante est mise en évidence
    const currentPageButton = screen.getByRole('button', { name: /3/ });
    expect(currentPageButton).toHaveAttribute('aria-current', 'page');
  });

  it('devrait appeler onPageChange avec la bonne page lors du clic sur les boutons', () => {
    render(<Pagination {...defaultProps} />);
    
    // Cliquer sur la page suivante
    fireEvent.click(screen.getByLabelText('pagination.nextPage'));
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(4);
    
    // Cliquer sur la page précédente
    fireEvent.click(screen.getByLabelText('pagination.previousPage'));
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);
    
    // Cliquer sur la première page
    fireEvent.click(screen.getByLabelText('pagination.firstPage'));
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(1);
    
    // Cliquer sur la dernière page
    fireEvent.click(screen.getByLabelText('pagination.lastPage'));
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(10);
  });

  it('devrait désactiver les boutons de navigation appropriés sur la première page', () => {
    render(
      <Pagination
        {...defaultProps}
        currentPage={1}
      />
    );
    
    // Les boutons précédent et première page devraient être désactivés
    expect(screen.getByLabelText('pagination.previousPage')).toBeDisabled();
    expect(screen.getByLabelText('pagination.firstPage')).toBeDisabled();
    
    // Les boutons suivant et dernière page ne devraient pas être désactivés
    expect(screen.getByLabelText('pagination.nextPage')).not.toBeDisabled();
    expect(screen.getByLabelText('pagination.lastPage')).not.toBeDisabled();
  });

  it('devrait désactiver les boutons de navigation appropriés sur la dernière page', () => {
    render(
      <Pagination
        {...defaultProps}
        currentPage={10}
      />
    );
    
    // Les boutons suivant et dernière page devraient être désactivés
    expect(screen.getByLabelText('pagination.nextPage')).toBeDisabled();
    expect(screen.getByLabelText('pagination.lastPage')).toBeDisabled();
    
    // Les boutons précédent et première page ne devraient pas être désactivés
    expect(screen.getByLabelText('pagination.previousPage')).not.toBeDisabled();
    expect(screen.getByLabelText('pagination.firstPage')).not.toBeDisabled();
  });

  it('ne devrait pas rendre le composant si totalPages <= 1', () => {
    const { container } = render(
      <Pagination
        {...defaultProps}
        totalPages={1}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('devrait afficher les ellipses et les pages appropriées avec un grand nombre de pages', () => {
    render(
      <Pagination
        {...defaultProps}
        currentPage={5}
        totalPages={20}
        maxPageButtons={5}
      />
    );
    
    // Devrait afficher la première page, des ellipses, les pages autour de la page courante, des ellipses, et la dernière page
    expect(screen.getByRole('button', { name: /1/ })).toBeInTheDocument();
    expect(screen.getAllByText('...').length).toBe(2); // Deux ellipses
    expect(screen.getByRole('button', { name: /5/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /20/ })).toBeInTheDocument();
  });

  it('devrait accepter et utiliser une fonction de traduction personnalisée', () => {
    const customTranslate = (key: string, options?: any) => {
      if (key === 'pagination.showing') return 'Affichage de';
      if (key === 'pagination.of') return 'sur';
      return key;
    };

    render(
      <Pagination
        {...defaultProps}
        translate={customTranslate}
      />
    );
    
    expect(screen.getByText(/Affichage de/)).toBeInTheDocument();
    expect(screen.getByText(/sur/)).toBeInTheDocument();
  });
}); 