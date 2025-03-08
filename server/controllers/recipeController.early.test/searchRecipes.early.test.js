


const { searchRecipes } = require('../recipeController');
const recipeService = require('../../services/recipeService');


jest.mock("../../services/recipeService");

describe('searchRecipes() searchRecipes method', () => {
    let req, res;

    beforeEach(() => {
        req = {
            query: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe('Happy paths', () => {
        it('should return recipes when search query is provided', async () => {
            // Arrange
            req.query = { query: 'chocolate', tags: 'dessert', page: '1', limit: '5' };
            const mockRecipes = {
                recipes: [{ id: 1, title: 'Chocolate Cake' }],
                pagination: { page: 1, limit: 5, total: 1 }
            };
            recipeService.searchRecipes.mockResolvedValue(mockRecipes);

            // Act
            await searchRecipes(req, res);

            // Assert
            expect(recipeService.searchRecipes).toHaveBeenCalledWith({
                searchQuery: 'chocolate',
                tags: ['dessert'],
                page: 1,
                limit: 5
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockRecipes.recipes,
                pagination: mockRecipes.pagination
            });
        });

        it('should return recipes with default pagination when page and limit are not provided', async () => {
            // Arrange
            req.query = { query: 'chocolate' };
            const mockRecipes = {
                recipes: [{ id: 1, title: 'Chocolate Cake' }],
                pagination: { page: 1, limit: 10, total: 1 }
            };
            recipeService.searchRecipes.mockResolvedValue(mockRecipes);

            // Act
            await searchRecipes(req, res);

            // Assert
            expect(recipeService.searchRecipes).toHaveBeenCalledWith({
                searchQuery: 'chocolate',
                tags: [],
                page: 1,
                limit: 10
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockRecipes.recipes,
                pagination: mockRecipes.pagination
            });
        });
    });

    describe('Edge cases', () => {
        it('should return 400 if search query is not provided', async () => {
            // Arrange
            req.query = {};

            // Act
            await searchRecipes(req, res);

            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Search query is required'
            });
        });

        it('should handle errors from the recipeService gracefully', async () => {
            // Arrange
            req.query = { query: 'chocolate' };
            const errorMessage = 'Database error';
            recipeService.searchRecipes.mockRejectedValue(new Error(errorMessage));

            // Act
            await searchRecipes(req, res);

            // Assert
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Không thể tìm kiếm công thức',
                error: errorMessage
            });
        });

        it('should handle empty tags gracefully', async () => {
            // Arrange
            req.query = { query: 'chocolate', tags: '' };
            const mockRecipes = {
                recipes: [{ id: 1, title: 'Chocolate Cake' }],
                pagination: { page: 1, limit: 10, total: 1 }
            };
            recipeService.searchRecipes.mockResolvedValue(mockRecipes);

            // Act
            await searchRecipes(req, res);

            // Assert
            expect(recipeService.searchRecipes).toHaveBeenCalledWith({
                searchQuery: 'chocolate',
                tags: [],
                page: 1,
                limit: 10
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockRecipes.recipes,
                pagination: mockRecipes.pagination
            });
        });
    });
});